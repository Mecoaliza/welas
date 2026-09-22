import slugify from "slugify";
import { db } from "@/lib/db";

export function toSlug(text: string) {
  return slugify(text, { lower: true, strict: true, locale: "pt" });
}

type SlugModel = "post" | "forumTopic" | "category" | "tag" | "language";

const uniqueCheckers: Record<
  SlugModel,
  (slug: string) => Promise<boolean>
> = {
  post: async (slug) => !!(await db.post.findUnique({ where: { slug }, select: { id: true } })),
  forumTopic: async (slug) => !!(await db.forumTopic.findUnique({ where: { slug }, select: { id: true } })),
  category: async (slug) => !!(await db.category.findUnique({ where: { slug }, select: { id: true } })),
  tag: async (slug) => !!(await db.tag.findUnique({ where: { slug }, select: { id: true } })),
  language: async (slug) => !!(await db.language.findUnique({ where: { slug }, select: { id: true } })),
};

/** Generates a URL-safe slug and appends `-2`, `-3`, ... until it is unique. */
export async function toUniqueSlug(text: string, model: SlugModel) {
  const base = toSlug(text) || "item";
  const exists = uniqueCheckers[model];

  let slug = base;
  let attempt = 1;
  while (await exists(slug)) {
    attempt += 1;
    slug = `${base}-${attempt}`;
  }
  return slug;
}
