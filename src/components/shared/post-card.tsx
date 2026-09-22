import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Heart, MessageCircle, PlayCircle, Podcast } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { MODULE_LABELS, MODULE_ROUTES } from "@/lib/constants";
import type { PostCard as PostCardData } from "@/modules/posts/types";

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes}:${remaining.toString().padStart(2, "0")}`;
}

export function PostCard({ post }: { post: PostCardData }) {
  const href = `${MODULE_ROUTES[post.module]}/${post.slug}`;

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-xl border bg-card transition-colors hover:border-primary/40"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {post.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImage}
            alt={post.title}
            className="size-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            {post.type === "PODCAST" ? (
              <Podcast className="size-8" />
            ) : post.type === "VIDEO" ? (
              <PlayCircle className="size-8" />
            ) : (
              <span className="text-2xl font-semibold">
                {MODULE_LABELS[post.module][0]}
              </span>
            )}
          </div>
        )}
        <Badge className="absolute left-2 top-2" variant="secondary">
          {MODULE_LABELS[post.module]}
        </Badge>
        {post.media[0]?.duration != null && (
          <Badge className="absolute bottom-2 right-2 bg-black/70 text-white" variant="secondary">
            {formatDuration(post.media[0].duration)}
          </Badge>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        {post.category && (
          <span className="text-xs font-medium uppercase tracking-wide text-primary">
            {post.category.name}
          </span>
        )}
        <h3 className="line-clamp-2 font-semibold leading-snug">{post.title}</h3>
        {post.summary && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{post.summary}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2 text-xs text-muted-foreground">
          <span>{post.author.name}</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Heart className="size-3.5" /> {post._count.likes}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="size-3.5" /> {post._count.comments}
            </span>
          </div>
        </div>
        {post.publishedAt && (
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(post.publishedAt, { addSuffix: true, locale: ptBR })}
          </span>
        )}
      </div>
    </Link>
  );
}
