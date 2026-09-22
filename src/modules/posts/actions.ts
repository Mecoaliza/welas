"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";

import { requireAdmin } from "@/lib/session";
import { toSlug, toUniqueSlug } from "@/lib/slug";
import { tagRepository } from "@/modules/tags/repository";
import { MODULE_ROUTES } from "@/lib/constants";
import { postRepository } from "./repository";
import { postSchema } from "./validators";
import type { ActionState } from "@/modules/auth/actions";

function parseTagNames(raw: string | undefined) {
  if (!raw) return [];
  return [...new Set(raw.split(",").map((t) => t.trim()).filter(Boolean))];
}

export async function createPostAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await requireAdmin();

  const parsed = postSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: "Dados inválidos.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;
  const tagNames = parseTagNames(data.tags);
  const tags = await tagRepository.upsertMany(tagNames, toSlug);
  const slug = await toUniqueSlug(data.title, "post");

  const createData: Prisma.PostCreateInput = {
    title: data.title,
    slug,
    summary: data.summary || null,
    content: data.content,
    coverImage: data.coverImage || null,
    type: data.type,
    status: data.status,
    module: data.module,
    bookAuthor: data.module === "LIVROS" ? data.bookAuthor || null : null,
    author: { connect: { id: admin.id } },
    category: data.categoryId ? { connect: { id: data.categoryId } } : undefined,
    language: data.module === "IDIOMAS" && data.languageId ? { connect: { id: data.languageId } } : undefined,
    publishedAt: data.status === "PUBLISHED" ? new Date() : null,
    tags: tags.length ? { create: tags.map((tag) => ({ tagId: tag.id })) } : undefined,
    media:
      data.type !== "ARTICLE" && data.mediaUrl
        ? {
            create: {
              type: data.type,
              url: data.mediaUrl,
              thumbnail: data.mediaThumbnail || null,
              duration: data.mediaDuration ?? null,
            },
          }
        : undefined,
  };

  const post = await postRepository.create(createData);

  revalidatePath("/admin/conteudos");
  revalidatePath(MODULE_ROUTES[data.module]);
  redirect(`/admin/conteudos/${post.id}`);
}

export async function updatePostAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const parsed = postSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success || !parsed.data.id) {
    return { error: "Dados inválidos.", fieldErrors: parsed.error?.flatten().fieldErrors };
  }

  const data = parsed.data;
  const existing = await postRepository.findById(data.id!);
  if (!existing) return { error: "Conteúdo não encontrado." };

  const tagNames = parseTagNames(data.tags);
  const tags = await tagRepository.upsertMany(tagNames, toSlug);

  const updateData: Prisma.PostUpdateInput = {
    title: data.title,
    summary: data.summary || null,
    content: data.content,
    coverImage: data.coverImage || null,
    type: data.type,
    status: data.status,
    module: data.module,
    bookAuthor: data.module === "LIVROS" ? data.bookAuthor || null : null,
    category: data.categoryId ? { connect: { id: data.categoryId } } : { disconnect: true },
    language:
      data.module === "IDIOMAS" && data.languageId
        ? { connect: { id: data.languageId } }
        : { disconnect: true },
    publishedAt:
      data.status === "PUBLISHED" && !existing.publishedAt ? new Date() : existing.publishedAt,
  };

  await postRepository.update(data.id!, updateData);
  await postRepository.replaceTags(
    data.id!,
    tags.map((tag) => tag.id)
  );

  if (data.type !== "ARTICLE" && data.mediaUrl) {
    await postRepository.update(data.id!, {
      media: {
        upsert: {
          create: {
            type: data.type,
            url: data.mediaUrl,
            thumbnail: data.mediaThumbnail || null,
            duration: data.mediaDuration ?? null,
          },
          update: {
            type: data.type,
            url: data.mediaUrl,
            thumbnail: data.mediaThumbnail || null,
            duration: data.mediaDuration ?? null,
          },
          where: { postId: data.id! },
        },
      },
    });
  }

  revalidatePath("/admin/conteudos");
  revalidatePath(MODULE_ROUTES[data.module]);
  revalidatePath(`/${data.module.toLowerCase()}/${existing.slug}`);
  return { success: true };
}

export async function deletePostAction(id: string) {
  await requireAdmin();
  const post = await postRepository.remove(id);
  revalidatePath("/admin/conteudos");
  revalidatePath(MODULE_ROUTES[post.module]);
}
