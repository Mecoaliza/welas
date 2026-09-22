import type { ContentModule, Post, PostStatus, PostType, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { PAGE_SIZE } from "@/lib/constants";
import { postCardInclude, postDetailInclude } from "./types";

export type PostFilters = {
  module?: ContentModule;
  categorySlug?: string;
  tagSlug?: string;
  languageSlug?: string;
  type?: PostType;
  status?: PostStatus;
  allStatuses?: boolean;
  authorId?: string;
  page?: number;
  pageSize?: number;
  sort?: "recent" | "popular" | "views";
};

function buildWhere(filters: PostFilters): Prisma.PostWhereInput {
  return {
    module: filters.module,
    type: filters.type,
    status: filters.allStatuses ? undefined : filters.status ?? "PUBLISHED",
    authorId: filters.authorId,
    category: filters.categorySlug ? { slug: filters.categorySlug } : undefined,
    language: filters.languageSlug ? { slug: filters.languageSlug } : undefined,
    tags: filters.tagSlug ? { some: { tag: { slug: filters.tagSlug } } } : undefined,
  };
}

function buildOrderBy(filters: PostFilters): Prisma.PostOrderByWithRelationInput {
  if (filters.sort === "popular") return { likes: { _count: "desc" } };
  if (filters.sort === "views") return { viewCount: "desc" };
  return filters.allStatuses ? { createdAt: "desc" } : { publishedAt: "desc" };
}

export const postRepository = {
  async list(filters: PostFilters) {
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? PAGE_SIZE;
    const where = buildWhere(filters);

    const [items, total] = await Promise.all([
      db.post.findMany({
        where,
        include: postCardInclude,
        orderBy: buildOrderBy(filters),
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.post.count({ where }),
    ]);

    return { items, total, page, pageSize, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
  },

  recent(limit: number, module?: ContentModule) {
    return db.post.findMany({
      where: { status: "PUBLISHED", module },
      include: postCardInclude,
      orderBy: { publishedAt: "desc" },
      take: limit,
    });
  },

  mostLiked(limit: number) {
    return db.post.findMany({
      where: { status: "PUBLISHED" },
      include: postCardInclude,
      orderBy: { likes: { _count: "desc" } },
      take: limit,
    });
  },

  trending(limit: number) {
    return db.post.findMany({
      where: { status: "PUBLISHED" },
      include: postCardInclude,
      orderBy: { viewCount: "desc" },
      take: limit,
    });
  },

  byType(type: PostType, limit: number) {
    return db.post.findMany({
      where: { status: "PUBLISHED", type },
      include: postCardInclude,
      orderBy: { publishedAt: "desc" },
      take: limit,
    });
  },

  findBySlug(slug: string) {
    return db.post.findUnique({ where: { slug }, include: postDetailInclude });
  },

  findById(id: string) {
    return db.post.findUnique({ where: { id }, include: postDetailInclude });
  },

  incrementViews(id: string) {
    return db.post.update({ where: { id }, data: { viewCount: { increment: 1 } } });
  },

  create(data: Prisma.PostCreateInput) {
    return db.post.create({ data, include: postDetailInclude });
  },

  update(id: string, data: Prisma.PostUpdateInput) {
    return db.post.update({ where: { id }, data, include: postDetailInclude });
  },

  remove(id: string): Promise<Post> {
    return db.post.delete({ where: { id } });
  },

  replaceTags(postId: string, tagIds: string[]) {
    return db.$transaction([
      db.postTag.deleteMany({ where: { postId } }),
      db.postTag.createMany({ data: tagIds.map((tagId) => ({ postId, tagId })) }),
    ]);
  },

  countByModule() {
    return db.post.groupBy({ by: ["module"], _count: { _all: true } });
  },

  countAll(status?: PostStatus) {
    return db.post.count({ where: status ? { status } : undefined });
  },
};
