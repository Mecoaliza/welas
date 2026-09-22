import { db } from "@/lib/db";

export const languageRepository = {
  listAll() {
    return db.language.findMany({ orderBy: { name: "asc" } });
  },

  findBySlug(slug: string) {
    return db.language.findUnique({ where: { slug } });
  },

  create(data: { name: string; slug: string }) {
    return db.language.create({ data });
  },

  remove(id: string) {
    return db.language.delete({ where: { id } });
  },
};
