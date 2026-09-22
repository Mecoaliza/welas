"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";

export async function togglePostLikeAction(postId: string, path?: string) {
  const user = await requireUser();

  const post = await db.post.findFirst({ where: { id: postId, status: "PUBLISHED" }, select: { id: true } });
  if (!post) throw new Error("Este conteúdo não está disponível.");

  const existing = await db.like.findUnique({
    where: { userId_postId: { userId: user.id, postId } },
  });

  if (existing) {
    await db.like.delete({ where: { id: existing.id } });
  } else {
    await db.like.create({ data: { userId: user.id, postId } });
  }

  if (path) revalidatePath(path);
  return { liked: !existing };
}

export async function toggleTopicLikeAction(topicId: string, path?: string) {
  const user = await requireUser();

  const topic = await db.forumTopic.findUnique({ where: { id: topicId }, select: { id: true } });
  if (!topic) throw new Error("Tópico não encontrado.");

  const existing = await db.like.findUnique({
    where: { userId_topicId: { userId: user.id, topicId } },
  });

  if (existing) {
    await db.like.delete({ where: { id: existing.id } });
  } else {
    await db.like.create({ data: { userId: user.id, topicId } });
  }

  if (path) revalidatePath(path);
  return { liked: !existing };
}
