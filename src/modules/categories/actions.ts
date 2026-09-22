"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

import { requireAdmin } from "@/lib/session";
import { toUniqueSlug } from "@/lib/slug";
import { categoryRepository } from "./repository";
import { categorySchema } from "./validators";

export type CategoryActionState = { error?: string };

export async function createCategoryAction(
  _prevState: CategoryActionState,
  formData: FormData
): Promise<CategoryActionState> {
  await requireAdmin();

  const parsed = categorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  const slug = await toUniqueSlug(parsed.data.name, "category");
  await categoryRepository.create({ name: parsed.data.name, slug, module: parsed.data.module });

  revalidatePath("/admin/categorias");
  return {};
}

export async function deleteCategoryAction(id: string) {
  await requireAdmin();

  try {
    await categoryRepository.remove(id);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      throw new Error("Esta categoria está em uso e não pode ser excluída.");
    }
    throw error;
  }

  revalidatePath("/admin/categorias");
}
