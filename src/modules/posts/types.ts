import type { Prisma } from "@prisma/client";

export const postCardInclude = {
  author: { select: { id: true, name: true, avatar: true } },
  category: { select: { id: true, name: true, slug: true } },
  language: { select: { id: true, name: true, slug: true } },
  media: { select: { type: true, duration: true, thumbnail: true } },
  tags: { include: { tag: true } },
  _count: { select: { likes: true, comments: true } },
} satisfies Prisma.PostInclude;

export type PostCard = Prisma.PostGetPayload<{ include: typeof postCardInclude }>;

export const postDetailInclude = {
  ...postCardInclude,
  media: { select: { type: true, url: true, duration: true, thumbnail: true } },
} satisfies Prisma.PostInclude;

export type PostDetail = Prisma.PostGetPayload<{ include: typeof postDetailInclude }>;
