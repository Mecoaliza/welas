import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Eye, Heart, MessageSquare, Pin, Lock } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { TopicCard } from "@/modules/forum/types";

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
}

export function TopicListItem({ topic }: { topic: TopicCard }) {
  return (
    <Link
      href={`/forum/topico/${topic.slug}`}
      className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:border-primary/40"
    >
      <Avatar className="hidden sm:flex">
        <AvatarImage src={topic.user.avatar ?? undefined} alt={topic.user.name} />
        <AvatarFallback>{initials(topic.user.name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {topic.status === "PINNED" && (
            <Pin className="size-3.5 text-primary" aria-label="Fixado" />
          )}
          {topic.status === "CLOSED" && (
            <Lock className="size-3.5 text-muted-foreground" aria-label="Fechado" />
          )}
          <h3 className="truncate font-medium">{topic.title}</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          {topic.user.name} ·{" "}
          {formatDistanceToNow(topic.createdAt, { addSuffix: true, locale: ptBR })} ·{" "}
          <Badge variant="outline" className="align-middle">
            {topic.category.name}
          </Badge>
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <MessageSquare className="size-4" /> {topic._count.replies}
        </span>
        <span className="flex items-center gap-1">
          <Heart className="size-4" /> {topic._count.likes}
        </span>
        <span className="hidden items-center gap-1 sm:flex">
          <Eye className="size-4" /> {topic.views}
        </span>
      </div>
    </Link>
  );
}
