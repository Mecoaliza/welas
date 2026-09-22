import type { ContentModule } from "@prisma/client";
import { db } from "@/lib/db";
import { postCardInclude } from "@/modules/posts/types";
import { topicCardInclude } from "@/modules/forum/types";

export type SearchFilter = "all" | ContentModule;

export async function globalSearch(query: string, filter: SearchFilter = "all") {
  const q = query.trim();
  if (!q) return { posts: [], topics: [] };

  const [posts, topics] = await Promise.all([
    filter === "FORUM"
      ? Promise.resolve([])
      : db.post.findMany({
          where: {
            status: "PUBLISHED",
            module: filter === "all" ? undefined : filter,
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { content: { contains: q, mode: "insensitive" } },
              { summary: { contains: q, mode: "insensitive" } },
              { category: { name: { contains: q, mode: "insensitive" } } },
              { tags: { some: { tag: { name: { contains: q, mode: "insensitive" } } } } },
            ],
          },
          include: postCardInclude,
          orderBy: { publishedAt: "desc" },
          take: 20,
        }),
    filter !== "all" && filter !== "FORUM"
      ? Promise.resolve([])
      : db.forumTopic.findMany({
          where: {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { content: { contains: q, mode: "insensitive" } },
              { category: { name: { contains: q, mode: "insensitive" } } },
            ],
          },
          include: topicCardInclude,
          orderBy: { createdAt: "desc" },
          take: 20,
        }),
  ]);

  return { posts, topics };
}
