import { db } from "@/lib/db";
import { postRepository } from "@/modules/posts/repository";
import { forumRepository } from "@/modules/forum/repository";
import { commentRepository } from "@/modules/comments/repository";
import { postCardInclude } from "@/modules/posts/types";

export async function getDashboardStats() {
  const [
    totalUsers,
    totalPosts,
    totalPublishedPosts,
    totalComments,
    totalTopics,
    totalReplies,
    postsByModule,
    topViewed,
    topLiked,
  ] = await Promise.all([
    db.user.count(),
    postRepository.countAll(),
    postRepository.countAll("PUBLISHED"),
    commentRepository.countAll(),
    forumRepository.countTopics(),
    forumRepository.countReplies(),
    postRepository.countByModule(),
    db.post.findMany({
      where: { status: "PUBLISHED" },
      include: postCardInclude,
      orderBy: { viewCount: "desc" },
      take: 5,
    }),
    db.post.findMany({
      where: { status: "PUBLISHED" },
      include: postCardInclude,
      orderBy: { likes: { _count: "desc" } },
      take: 5,
    }),
  ]);

  return {
    totalUsers,
    totalPosts,
    totalPublishedPosts,
    totalComments,
    totalTopics,
    totalReplies,
    postsByModule,
    topViewed,
    topLiked,
  };
}
