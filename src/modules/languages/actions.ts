"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@prisma/client";

import { requireAdmin } from "@/lib/session";
import { toUniqueSlug } from "@/lib/slug";
import { languageRepository } from "./repository";

const languageSchema = z.object({
  name: z.string().trim().min(2, "Nome muito curto").max(60),
});

export type LanguageActionState = { error?: string };

export async function createLanguageAction(
  _prevState: LanguageActionState,
  formData: FormData
): Promise<LanguageActionState> {
  await requireAdmin();

  const parsed = languageSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  const slug = await toUniqueSlug(parsed.data.name, "language");
  await languageRepository.create({ name: parsed.data.name, slug });

  revalidatePath("/admin/idiomas");
  return {};
}

export async function deleteLanguageAction(id: string) {
  await requireAdmin();

  try {
    await languageRepository.remove(id);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      throw new Error("Este idioma está em uso e não pode ser excluído.");
    }
    throw error;
  }

  revalidatePath("/admin/idiomas");
}
