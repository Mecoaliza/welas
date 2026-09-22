import type { ForumTopicStatus, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { PAGE_SIZE, FORUM_REPLIES_PAGE_SIZE } from "@/lib/constants";
import { topicCardInclude, topicDetailInclude } from "./types";

export const forumRepository = {
  listCategories() {
    return db.category.findMany({
      where: { module: "FORUM" },
      orderBy: { name: "asc" },
      include: { _count: { select: { forumTopics: true } } },
    });
  },

  findCategoryBySlug(slug: string) {
    return db.category.findFirst({ where: { slug, module: "FORUM" } });
  },

  findCategoryById(id: string) {
    return db.category.findFirst({ where: { id, module: "FORUM" } });
  },

  async listTopics({
    categorySlug,
    page = 1,
  }: {
    categorySlug?: string;
    page?: number;
  }) {
    const where: Prisma.ForumTopicWhereInput = categorySlug
      ? { category: { slug: categorySlug } }
      : {};

    const [items, total] = await Promise.all([
      db.forumTopic.findMany({
        where,
        include: topicCardInclude,
        orderBy: [{ status: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      db.forumTopic.count({ where }),
    ]);

    return { items, total, page, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
  },

  recentTopics(limit: number) {
    return db.forumTopic.findMany({
      include: topicCardInclude,
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },

  findBySlug(slug: string) {
    return db.forumTopic.findUnique({ where: { slug }, include: topicDetailInclude });
  },

  findById(id: string) {
    return db.forumTopic.findUnique({ where: { id } });
  },

  incrementViews(id: string) {
    return db.forumTopic.update({ where: { id }, data: { views: { increment: 1 } } });
  },

  create(data: { userId: string; categoryId: string; title: string; slug: string; content: string }) {
    return db.forumTopic.create({ data });
  },

  updateStatus(id: string, status: ForumTopicStatus) {
    return db.forumTopic.update({ where: { id }, data: { status } });
  },

  update(id: string, data: { title?: string; content?: string }) {
    return db.forumTopic.update({ where: { id }, data });
  },

  remove(id: string) {
    return db.forumTopic.delete({ where: { id } });
  },

  async listReplies(topicId: string, page = 1) {
    const [items, total] = await Promise.all([
      db.forumReply.findMany({
        where: { topicId },
        include: { user: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: "asc" },
        skip: (page - 1) * FORUM_REPLIES_PAGE_SIZE,
        take: FORUM_REPLIES_PAGE_SIZE,
      }),
      db.forumReply.count({ where: { topicId } }),
    ]);
    return { items, total, page, pageCount: Math.max(1, Math.ceil(total / FORUM_REPLIES_PAGE_SIZE)) };
  },

  createReply(data: { topicId: string; userId: string; content: string }) {
    return db.forumReply.create({
      data,
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });
  },

  findReplyById(id: string) {
    return db.forumReply.findUnique({ where: { id } });
  },

  removeReply(id: string) {
    return db.forumReply.delete({ where: { id } });
  },

  updateReply(id: string, content: string) {
    return db.forumReply.update({
      where: { id },
      data: { content },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });
  },

  countTopics() {
    return db.forumTopic.count();
  },

  countReplies() {
    return db.forumReply.count();
  },

  countRepliesForTopic(topicId: string) {
    return db.forumReply.count({ where: { topicId } });
  },
};
