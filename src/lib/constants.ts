import type { ContentModule } from "@prisma/client";

export const MODULE_LABELS: Record<ContentModule, string> = {
  TECNOLOGIA: "Tecnologia",
  LIVROS: "Livros",
  IDIOMAS: "Idiomas",
  FORUM: "Fórum",
};

/**
 * Post.module is typed as the full ContentModule enum, but a Post's module
 * is never actually FORUM (that value is only used for forum categories) —
 * the FORUM entry exists purely so this map can be indexed by Post.module
 * without a cast.
 */
export const MODULE_ROUTES: Record<ContentModule, string> = {
  TECNOLOGIA: "/tecnologia",
  LIVROS: "/livros",
  IDIOMAS: "/idiomas",
  FORUM: "/forum",
};

export const POST_TYPE_LABELS = {
  ARTICLE: "Artigo",
  VIDEO: "Vídeo",
  PODCAST: "Podcast",
} as const;

export const FORUM_STATUS_LABELS = {
  OPEN: "Aberto",
  CLOSED: "Fechado",
  PINNED: "Fixado",
} as const;

export const PAGE_SIZE = 12;
export const COMMENTS_PAGE_SIZE = 20;
export const FORUM_REPLIES_PAGE_SIZE = 20;
