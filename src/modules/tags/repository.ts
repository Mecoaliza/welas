import { db } from "@/lib/db";

export const tagRepository = {
  listAll() {
    return db.tag.findMany({ orderBy: { name: "asc" } });
  },

  findByNames(names: string[]) {
    return db.tag.findMany({ where: { name: { in: names } } });
  },

  async upsertMany(names: string[], slugFor: (name: string) => string) {
    const tags = await Promise.all(
      names.map((name) =>
        db.tag.upsert({
          where: { name },
          create: { name, slug: slugFor(name) },
          update: {},
        })
      )
    );
    return tags;
  },

  remove(id: string) {
    return db.tag.delete({ where: { id } });
  },
};
