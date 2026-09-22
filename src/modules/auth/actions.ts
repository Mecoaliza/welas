"use server";

import crypto from "crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";

import { signIn, signOut } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/mail";
import { RATE_LIMITS, rateLimit } from "@/lib/rate-limit";
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
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
}

export async function loginAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const ip = await clientIp();
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { error: "Dados inválidos.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const limited = rateLimit(`login:${ip}:${parsed.data.email}`, RATE_LIMITS.login);
  if (!limited.success) {
    return { error: "Muitas tentativas de login. Tente novamente em alguns minutos." };
  }

  const callbackUrl = formData.get("callbackUrl")?.toString() || "/";

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: callbackUrl,
    });
  } catch (error) {
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

  const existing = await userRepository.findByEmail(parsed.data.email);
  if (existing) {
    return {
      error: "Este e-mail já está cadastrado.",
      fieldErrors: { email: ["Este e-mail já está cadastrado."] },
    };
  }

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
    await db.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 60 * 60_000),
      },
    });

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

  const resetToken = await db.passwordResetToken.findUnique({
    where: { token: parsed.data.token },
  });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    return { error: "Este link de redefinição é inválido ou expirou." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  await db.$transaction([
    db.user.update({ where: { id: resetToken.userId }, data: { passwordHash } }),
    db.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
  ]);

  redirect("/login?reset=1");
}
