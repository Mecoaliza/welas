import type { ContentModule } from "@prisma/client";
import { db } from "@/lib/db";

export const categoryRepository = {
  listByModule(module: ContentModule) {
    return db.category.findMany({ where: { module }, orderBy: { name: "asc" } });
  },

  findBySlug(slug: string) {
    return db.category.findUnique({ where: { slug } });
  },

  findById(id: string) {
    return db.category.findUnique({ where: { id } });
  },

  listAll() {
    return db.category.findMany({ orderBy: [{ module: "asc" }, { name: "asc" }] });
  },

  create(data: { name: string; slug: string; module: ContentModule }) {
    return db.category.create({ data });
  },

  update(id: string, data: { name?: string; slug?: string }) {
    return db.category.update({ where: { id }, data });
  },

  remove(id: string) {
    return db.category.delete({ where: { id } });
  },

  countPosts(id: string) {
    return db.post.count({ where: { categoryId: id } });
  },
};
