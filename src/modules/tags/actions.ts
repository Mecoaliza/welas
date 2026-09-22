"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/session";
import { tagRepository } from "./repository";

export async function deleteTagAction(id: string) {
  await requireAdmin();
  await tagRepository.remove(id);
  revalidatePath("/admin/tags");
}
