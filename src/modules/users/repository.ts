import type { Role } from "@prisma/client";
import { db } from "@/lib/db";

export const userRepository = {
  async listAll(page = 1) {
    const pageSize = 20;
    const [items, total] = await Promise.all([
      db.user.findMany({
        select: { id: true, name: true, email: true, avatar: true, role: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.user.count(),
    ]);
    return { items, total, page, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
  },

  updateRole(id: string, role: Role) {
    return db.user.update({ where: { id }, data: { role } });
  },

  remove(id: string) {
    return db.user.delete({ where: { id } });
  },

  findByEmail(email: string) {
    return db.user.findUnique({ where: { email } });
  },

  findById(id: string) {
    return db.user.findUnique({ where: { id } });
  },

  create(data: { name: string; email: string; passwordHash: string }) {
    return db.user.create({ data });
  },

  updateProfile(
    id: string,
    data: Partial<{ name: string; avatar: string | null; bio: string | null }>
  ) {
    return db.user.update({ where: { id }, data });
  },

  updatePassword(id: string, passwordHash: string) {
    return db.user.update({ where: { id }, data: { passwordHash } });
  },

  async withProfileStats(id: string) {
    const [user, topicsCount, commentsCount, recentTopics] = await Promise.all([
      db.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          bio: true,
          role: true,
          createdAt: true,
        },
      }),
      db.forumTopic.count({ where: { userId: id } }),
      db.comment.count({ where: { userId: id } }),
      db.forumTopic.findMany({
        where: { userId: id },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, title: true, slug: true, createdAt: true, status: true },
      }),
    ]);

    if (!user) return null;

    return { ...user, topicsCount, commentsCount, recentTopics };
  },
};
