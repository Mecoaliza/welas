"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ForumTopicStatus } from "@prisma/client";

import { requireAdmin, requireUser } from "@/lib/session";
import { toUniqueSlug } from "@/lib/slug";
import { RATE_LIMITS, rateLimit } from "@/lib/rate-limit";
import { forumRepository } from "./repository";
import { replySchema, topicSchema } from "./validators";
import type { ActionState } from "@/modules/auth/actions";

export async function createTopicAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();

  const limited = await rateLimit(`topic:${user.id}`, RATE_LIMITS.post);
  if (!limited.success) return { error: "Aguarde um pouco antes de criar outro tópico." };

  const parsed = topicSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: "Dados inválidos.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const category = await forumRepository.findCategoryById(parsed.data.categoryId);
  if (!category) return { error: "Categoria inválida." };

  const slug = await toUniqueSlug(parsed.data.title, "forumTopic");

  const topic = await forumRepository.create({
    userId: user.id,
    categoryId: parsed.data.categoryId,
    title: parsed.data.title,
    content: parsed.data.content,
    slug,
  });

  revalidatePath("/forum");
  redirect(`/forum/topico/${topic.slug}`);
}

export async function updateTopicAction(topicId: string, path: string, content: string) {
  const user = await requireUser();
  const topic = await forumRepository.findById(topicId);
  if (!topic) throw new Error("Tópico não encontrado.");
  if (topic.userId !== user.id && user.role !== "ADMIN") {
    throw new Error("Você não tem permissão para editar este tópico.");
  }
  if (topic.status === "CLOSED" && user.role !== "ADMIN") {
    throw new Error("Este tópico está fechado e não pode ser editado.");
  }

  const parsed = topicSchema.pick({ content: true }).safeParse({ content });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Conteúdo inválido.");

  await forumRepository.update(topicId, { content: parsed.data.content });
  revalidatePath(path);
}

export async function deleteTopicAction(topicId: string) {
  const user = await requireUser();
  const topic = await forumRepository.findById(topicId);
  if (!topic) return;

  const isOwner = topic.userId === user.id;
  const isAdmin = user.role === "ADMIN";

  if (!isAdmin && !isOwner) {
    throw new Error("Você não tem permissão para excluir este tópico.");
  }

  if (isOwner && !isAdmin) {
    const repliesCount = await forumRepository.countRepliesForTopic(topicId);
    if (repliesCount > 0) {
      throw new Error("Este tópico já tem respostas e não pode mais ser excluído.");
    }
  }

  await forumRepository.remove(topicId);
  revalidatePath("/forum");
  redirect("/forum");
}

export async function setTopicStatusAction(topicId: string, status: ForumTopicStatus, path: string) {
  await requireAdmin();
  await forumRepository.updateStatus(topicId, status);
  revalidatePath(path);
  revalidatePath("/forum");
}

export type ReplyActionState = { error?: string };

export async function createReplyAction(
  topicId: string,
  path: string,
  _prevState: ReplyActionState,
  formData: FormData
): Promise<ReplyActionState> {
  const user = await requireUser();

  const limited = await rateLimit(`reply:${user.id}`, RATE_LIMITS.comment);
  if (!limited.success) return { error: "Você está respondendo rápido demais. Aguarde um pouco." };

  const topic = await forumRepository.findById(topicId);
  if (!topic) return { error: "Tópico não encontrado." };
  if (topic.status === "CLOSED") return { error: "Este tópico está fechado para novas respostas." };

  const parsed = replySchema.safeParse({ content: formData.get("content") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Resposta inválida." };

  await forumRepository.createReply({ topicId, userId: user.id, content: parsed.data.content });
  revalidatePath(path);
  return {};
}

export async function updateReplyAction(replyId: string, path: string, content: string) {
  const user = await requireUser();
  const reply = await forumRepository.findReplyById(replyId);
  if (!reply) throw new Error("Resposta não encontrada.");
  if (reply.userId !== user.id && user.role !== "ADMIN") {
    throw new Error("Você não tem permissão para editar esta resposta.");
  }

  const parsed = replySchema.safeParse({ content });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Resposta inválida.");

  await forumRepository.updateReply(replyId, parsed.data.content);
  revalidatePath(path);
}

export async function deleteReplyAction(replyId: string, path: string) {
  const user = await requireUser();
  const reply = await forumRepository.findReplyById(replyId);
  if (!reply) return;
  if (reply.userId !== user.id && user.role !== "ADMIN") {
    throw new Error("Você não tem permissão para excluir esta resposta.");
  }

  await forumRepository.removeReply(replyId);
  revalidatePath(path);
}
