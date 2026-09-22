import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { formatDate } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Eye, Lock, MessageSquare, Pin } from "lucide-react";

import { forumRepository } from "@/modules/forum/repository";
import { getSessionUser } from "@/lib/session";
import { db } from "@/lib/db";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LikeButton } from "@/components/shared/like-button";
import { ContentRenderer } from "@/components/shared/content-renderer";
import { ReplyForm } from "@/components/forum/reply-form";
import { ReplyItem } from "@/components/forum/reply-item";
import { TopicAdminMenu } from "@/components/forum/topic-admin-menu";
import { EmptyState } from "@/components/shared/empty-state";

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const topic = await forumRepository.findBySlug(slug);
  return { title: topic?.title ?? "Tópico" };
}

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const topic = await forumRepository.findBySlug(slug);
  if (!topic) notFound();

  await forumRepository.incrementViews(topic.id);

  const path = `/forum/topico/${slug}`;
  const [user, repliesResult] = await Promise.all([
    getSessionUser(),
    forumRepository.listReplies(topic.id),
  ]);

  const liked = user
    ? Boolean(
        await db.like.findUnique({
          where: { userId_topicId: { userId: user.id, topicId: topic.id } },
        })
      )
    : false;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{topic.category.name}</Badge>
            {topic.status === "PINNED" && (
              <Badge variant="secondary">
                <Pin className="size-3" /> Fixado
              </Badge>
            )}
            {topic.status === "CLOSED" && (
              <Badge variant="secondary">
                <Lock className="size-3" /> Fechado
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-balance">{topic.title}</h1>
        </div>
        {user?.role === "ADMIN" && (
          <TopicAdminMenu topicId={topic.id} status={topic.status} path={path} />
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-y py-3">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={topic.user.avatar ?? undefined} alt={topic.user.name} />
            <AvatarFallback>{initials(topic.user.name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{topic.user.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatDate(topic.createdAt, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Eye className="size-4" /> {topic.views}
          </span>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <MessageSquare className="size-4" /> {topic._count.replies}
          </span>
          <LikeButton
            target={{ kind: "topic", id: topic.id }}
            initialLiked={liked}
            initialCount={topic._count.likes}
            path={path}
          />
        </div>
      </div>

      <ContentRenderer content={topic.content} />

      <section className="space-y-6">
        <h2 className="text-lg font-semibold">Respostas ({repliesResult.total})</h2>

        {topic.status === "CLOSED" ? (
          <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
            Este tópico está fechado para novas respostas.
          </p>
        ) : (
          user && <ReplyForm topicId={topic.id} path={path} />
        )}

        {repliesResult.items.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="Nenhuma resposta ainda"
            description="Seja a primeira pessoa a responder."
          />
        ) : (
          <div className="space-y-4">
            {repliesResult.items.map((reply) => (
              <ReplyItem
                key={reply.id}
                reply={reply}
                path={path}
                canModerate={user?.id === reply.user.id || user?.role === "ADMIN"}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
