import Link from "next/link";
import { formatDate } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Eye } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LikeButton } from "@/components/shared/like-button";
import { MediaPlayer } from "@/components/shared/media-player";
import { ContentRenderer } from "@/components/shared/content-renderer";
import { CommentSection } from "@/components/shared/comment-section";
import { getSessionUser } from "@/lib/session";
import { db } from "@/lib/db";
import { MODULE_LABELS, MODULE_ROUTES } from "@/lib/constants";
import type { PostDetail as PostDetailData } from "@/modules/posts/types";

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
}

export async function PostDetail({ post, path }: { post: PostDetailData; path: string }) {
  const user = await getSessionUser();
  const liked = user
    ? Boolean(
        await db.like.findUnique({
          where: { userId_postId: { userId: user.id, postId: post.id } },
        })
      )
    : false;

  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-6">
      {post.coverImage && !post.media[0] && (
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.coverImage} alt={post.title} className="size-full object-cover" />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{MODULE_LABELS[post.module]}</Badge>
        {post.category && (
          <Link href={`${MODULE_ROUTES[post.module]}?categoria=${post.category.slug}`}>
            <Badge variant="outline">{post.category.name}</Badge>
          </Link>
        )}
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-balance">{post.title}</h1>

      {post.summary && <p className="text-lg text-muted-foreground">{post.summary}</p>}

      <div className="flex flex-wrap items-center justify-between gap-4 border-y py-3">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={post.author.avatar ?? undefined} alt={post.author.name} />
            <AvatarFallback>{initials(post.author.name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{post.author.name}</p>
            {post.publishedAt && (
              <p className="text-xs text-muted-foreground">
                {formatDate(post.publishedAt, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Eye className="size-4" /> {post.viewCount}
          </span>
          <LikeButton
            target={{ kind: "post", id: post.id }}
            initialLiked={liked}
            initialCount={post._count.likes}
            path={path}
          />
        </div>
      </div>

      {post.media[0] && <MediaPlayer type={post.media[0].type} url={post.media[0].url} />}

      {post.module === "LIVROS" && post.bookAuthor && (
        <p className="text-sm text-muted-foreground">
          Autor do livro: <span className="font-medium text-foreground">{post.bookAuthor}</span>
        </p>
      )}

      <ContentRenderer content={post.content} />

      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {post.tags.map(({ tag }) => (
            <Badge key={tag.id} variant="outline">
              #{tag.name}
            </Badge>
          ))}
        </div>
      )}

      <CommentSection postId={post.id} path={path} />
    </article>
  );
}
