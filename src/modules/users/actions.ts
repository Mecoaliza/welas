"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import type { Role } from "@prisma/client";
import { Prisma } from "@prisma/client";

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

  return { success: true };
}

export async function updateUserRoleAction(userId: string, role: Role) {
  const admin = await requireAdmin();
  if (admin.id === userId) {
    throw new Error("Você não pode alterar seu próprio papel.");
  }

  await userRepository.updateRole(userId, role);
  revalidatePath("/admin/usuarios");
}

export async function deleteUserAction(userId: string) {
  const admin = await requireAdmin();
  if (admin.id === userId) {
    throw new Error("Você não pode excluir sua própria conta por aqui.");
  }

  try {
    await userRepository.remove(userId);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      throw new Error("Este usuário publicou conteúdos e não pode ser excluído.");
    }
    throw error;
  }

  revalidatePath("/admin/usuarios");
}
