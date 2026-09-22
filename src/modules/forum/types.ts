import type { Prisma } from "@prisma/client";

export const topicCardInclude = {
  user: { select: { id: true, name: true, avatar: true } },
  category: { select: { id: true, name: true, slug: true } },
  _count: { select: { replies: true, likes: true } },
} satisfies Prisma.ForumTopicInclude;

export type TopicCard = Prisma.ForumTopicGetPayload<{ include: typeof topicCardInclude }>;

export const topicDetailInclude = {
  ...topicCardInclude,
} satisfies Prisma.ForumTopicInclude;

export type TopicDetail = Prisma.ForumTopicGetPayload<{ include: typeof topicDetailInclude }>;
