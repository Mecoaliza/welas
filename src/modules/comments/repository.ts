import { db } from "@/lib/db";
import { COMMENTS_PAGE_SIZE } from "@/lib/constants";

const commentInclude = {
  user: { select: { id: true, name: true, avatar: true } },
} as const;

export const commentRepository = {
  async listByPost(postId: string, page = 1) {
    const where = { postId, parentId: null };
    const [items, total] = await Promise.all([
      db.comment.findMany({
        where,
        include: commentInclude,
        orderBy: { createdAt: "asc" },
        skip: (page - 1) * COMMENTS_PAGE_SIZE,
        take: COMMENTS_PAGE_SIZE,
      }),
      db.comment.count({ where }),
    ]);
    return { items, total, page, pageCount: Math.max(1, Math.ceil(total / COMMENTS_PAGE_SIZE)) };
  },

  findById(id: string) {
    return db.comment.findUnique({ where: { id } });
  },

  create(data: { userId: string; postId: string; content: string }) {
    return db.comment.create({ data, include: commentInclude });
  },

  update(id: string, content: string) {
    return db.comment.update({ where: { id }, data: { content }, include: commentInclude });
  },

  remove(id: string) {
    return db.comment.delete({ where: { id } });
  },

  countAll() {
    return db.comment.count();
  },

  async listAllForAdmin(page = 1) {
    const pageSize = 20;
    const [items, total] = await Promise.all([
      db.comment.findMany({
        include: {
          user: { select: { id: true, name: true, avatar: true } },
          post: { select: { id: true, title: true, slug: true, module: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.comment.count(),
    ]);
    return { items, total, page, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
  },
};
