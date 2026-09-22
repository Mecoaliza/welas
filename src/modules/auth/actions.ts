"use server";

import crypto from "crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";

import { RateLimitedSignin, signIn, signOut } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/mail";
import { RATE_LIMITS, getClientIp, rateLimit } from "@/lib/rate-limit";
import { userRepository } from "@/modules/users/repository";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "./validators";

export type ActionState = {
  error?: string;
  success?: boolean;
  fieldErrors?: Record<string, string[] | undefined>;
};

async function clientIp() {
  return getClientIp(await headers());
}

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/** Only same-site paths: "/x" yes, "//evil.com" or "https://…" no. */
function safeCallbackUrl(raw: string | undefined) {
  return raw && raw.startsWith("/") && !raw.startsWith("//") && !raw.startsWith("/\\") ? raw : "/";
}

export async function loginAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { error: "Dados inválidos.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  // Rate limiting happens inside authorize() (src/lib/auth.ts).
  const callbackUrl = safeCallbackUrl(formData.get("callbackUrl")?.toString());

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: callbackUrl,
    });
  } catch (error) {
    if (error instanceof RateLimitedSignin) {
      return { error: "Muitas tentativas de login. Tente novamente em alguns minutos." };
    }
    if (error instanceof AuthError) {
      return { error: "E-mail ou senha inválidos." };
    }
    throw error;
  }

  return {};
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}

export async function registerAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const ip = await clientIp();
  const limited = rateLimit(`register:${ip}`, RATE_LIMITS.register);
  if (!limited.success) {
    return { error: "Muitas tentativas de cadastro. Tente novamente mais tarde." };
  }

  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: "Dados inválidos.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  // An existing e-mail gets the same response as a new signup (no account is
  // created), so the form can't be used to discover who is registered.
  const existing = await userRepository.findByEmail(parsed.data.email);
  if (existing) redirect("/login?registered=1");

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await userRepository.create({
    name: parsed.data.name,
    email: parsed.data.email,
    passwordHash,
  });

  redirect("/login?registered=1");
}

export async function forgotPasswordAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const ip = await clientIp();
  const limited = rateLimit(`forgot:${ip}`, RATE_LIMITS.passwordReset);
  if (!limited.success) {
    return { error: "Muitas tentativas. Tente novamente mais tarde." };
  }

  const parsed = forgotPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: "E-mail inválido.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const user = await userRepository.findByEmail(parsed.data.email);

  // Always respond with success to avoid leaking which e-mails are registered.
  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    // Only the latest link works; the DB keeps a hash, never the token itself.
    await db.$transaction([
      db.passwordResetToken.deleteMany({ where: { userId: user.id } }),
      db.passwordResetToken.create({
        data: {
          userId: user.id,
          token: hashToken(token),
          expiresAt: new Date(Date.now() + 60 * 60_000),
        },
      }),
    ]);

    const resetUrl = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/reset-password?token=${token}`;
    await sendPasswordResetEmail(user.email, resetUrl);
  }

  return { success: true };
}

export async function resetPasswordAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: "Dados inválidos.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const invalid = { error: "Este link de redefinição é inválido ou expirou." };
  const tokenHash = hashToken(parsed.data.token);
  const resetToken = await db.passwordResetToken.findUnique({ where: { token: tokenHash } });
  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) return invalid;

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  const used = await db.$transaction(async (tx) => {
    // Claim the token atomically: a second concurrent request finds usedAt set and gets 0.
    const claimed = await tx.passwordResetToken.updateMany({
      where: { id: resetToken.id, usedAt: null, expiresAt: { gt: new Date() } },
      data: { usedAt: new Date() },
    });
    if (claimed.count === 0) return false;

    await tx.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash, passwordChangedAt: new Date() },
    });
    await tx.passwordResetToken.deleteMany({
      where: { userId: resetToken.userId, id: { not: resetToken.id } },
    });
    return true;
  });
  if (!used) return invalid;

  redirect("/login?reset=1");
}
