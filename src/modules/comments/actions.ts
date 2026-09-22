"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { RATE_LIMITS, rateLimit } from "@/lib/rate-limit";
import { commentRepository } from "./repository";
import { commentSchema } from "./validators";

export type CommentActionState = { error?: string };

export async function createCommentAction(
  postId: string,
  path: string,
  _prevState: CommentActionState,
  formData: FormData
): Promise<CommentActionState> {
  const user = await requireUser();

  const limited = rateLimit(`comment:${user.id}`, RATE_LIMITS.comment);
  if (!limited.success) return { error: "Você está comentando rápido demais. Aguarde um pouco." };

  const parsed = commentSchema.safeParse({ content: formData.get("content") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Comentário inválido." };

  const post = await db.post.findFirst({ where: { id: postId, status: "PUBLISHED" }, select: { id: true } });
  if (!post) return { error: "Este conteúdo não está disponível para comentários." };

  await commentRepository.create({ userId: user.id, postId, content: parsed.data.content });
  revalidatePath(path);
  return {};
}

export async function updateCommentAction(commentId: string, path: string, content: string) {
  const user = await requireUser();
  const comment = await commentRepository.findById(commentId);
  if (!comment) throw new Error("Comentário não encontrado.");
  if (comment.userId !== user.id && user.role !== "ADMIN") {
    throw new Error("Você não tem permissão para editar este comentário.");
  }

  const parsed = commentSchema.safeParse({ content });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Comentário inválido.");

  await commentRepository.update(commentId, parsed.data.content);
  revalidatePath(path);
}

export async function deleteCommentAction(commentId: string, path: string) {
  const user = await requireUser();
  const comment = await commentRepository.findById(commentId);
  if (!comment) return;
  if (comment.userId !== user.id && user.role !== "ADMIN") {
    throw new Error("Você não tem permissão para excluir este comentário.");
  }

  await commentRepository.remove(commentId);
  revalidatePath(path);
}
