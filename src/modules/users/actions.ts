"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { signIn } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireAdmin, requireUser } from "@/lib/session";
import { userRepository } from "./repository";
import { changePasswordSchema, profileSchema } from "./validators";
import type { ActionState } from "@/modules/auth/actions";

export async function updateProfileAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: "Dados inválidos.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await userRepository.updateProfile(user.id, {
    name: parsed.data.name,
    avatar: parsed.data.avatar || null,
    bio: parsed.data.bio || null,
  });

  revalidatePath("/perfil");
  return { success: true };
}

export async function changePasswordAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const sessionUser = await requireUser();

  const parsed = changePasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: "Dados inválidos.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const user = await userRepository.findById(sessionUser.id);
  if (!user?.passwordHash) {
    return { error: "Esta conta não possui senha definida (login social)." };
  }

  const isValid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!isValid) {
    return {
      error: "Senha atual incorreta.",
      fieldErrors: { currentPassword: ["Senha atual incorreta."] },
    };
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await userRepository.updatePassword(user.id, passwordHash);

  // Changing the password ends every other session; re-issue this one so the
  // user who just changed it stays signed in.
  await signIn("credentials", {
    email: user.email,
    password: parsed.data.newPassword,
    redirect: false,
  });

  return { success: true };
}

const roleSchema = z.enum(["USER", "ADMIN"]);

/**
 * Runs `change` only if at least one other ADMIN would remain. Serializable so two
 * admins demoting each other at the same time can't leave the platform with none.
 */
async function withAdminGuard(userId: string, change: (tx: Prisma.TransactionClient) => Promise<unknown>) {
  await db.$transaction(
    async (tx) => {
      const target = await tx.user.findUnique({ where: { id: userId }, select: { role: true } });
      if (target?.role === "ADMIN") {
        const admins = await tx.user.count({ where: { role: "ADMIN" } });
        if (admins <= 1) throw new Error("É preciso manter pelo menos um administrador.");
      }
      await change(tx);
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
  );
}

export async function updateUserRoleAction(userId: string, rawRole: string) {
  const admin = await requireAdmin();
  const role = roleSchema.parse(rawRole);
  if (admin.id === userId) {
    throw new Error("Você não pode alterar seu próprio papel.");
  }

  if (role === "ADMIN") {
    await userRepository.updateRole(userId, role);
  } else {
    await withAdminGuard(userId, (tx) => tx.user.update({ where: { id: userId }, data: { role } }));
  }
  revalidatePath("/admin/usuarios");
}

export async function deleteUserAction(userId: string) {
  const admin = await requireAdmin();
  if (admin.id === userId) {
    throw new Error("Você não pode excluir sua própria conta por aqui.");
  }

  try {
    await withAdminGuard(userId, (tx) => tx.user.delete({ where: { id: userId } }));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      throw new Error("Este usuário publicou conteúdos e não pode ser excluído.");
    }
    throw error;
  }

  revalidatePath("/admin/usuarios");
}
