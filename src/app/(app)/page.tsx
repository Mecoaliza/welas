import Link from "next/link";
import { ArrowRight, BookOpen, Cpu, FileQuestion, Languages, MessagesSquare } from "lucide-react";

import { requireUser } from "@/lib/session";
import { postRepository } from "@/modules/posts/repository";
import { forumRepository } from "@/modules/forum/repository";
import { PostCard } from "@/components/shared/post-card";
import { TopicListItem } from "@/components/forum/topic-list-item";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent } from "@/components/ui/card";

const QUICK_LINKS = [
  { title: "Tecnologia", href: "/tecnologia", icon: Cpu },
  { title: "Livros", href: "/livros", icon: BookOpen },
  { title: "Idiomas", href: "/idiomas", icon: Languages },
  { title: "Fórum", href: "/forum", icon: MessagesSquare },
];

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold">{title}</h2>
      <Link
        href={href}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        Ver todos <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}

export default async function DashboardPage() {
  const user = await requireUser();

  const [recent, mostLiked, videos, podcasts, topics] = await Promise.all([
    postRepository.recent(6),
    postRepository.mostLiked(4),
    postRepository.byType("VIDEO", 4),
    postRepository.byType("PODCAST", 4),
    forumRepository.recentTopics(5),
  ]);

  const hasAnyContent = recent.length > 0;

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Olá, {user.name?.split(" ")[0]} 👋</h1>
        <p className="text-muted-foreground">
          Bem-vindo(a) de volta à ConectaX. Veja o que rolou na comunidade.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {QUICK_LINKS.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="transition-colors hover:border-primary/40">
              <CardContent className="flex flex-col items-center gap-2 py-6 text-center">
                <link.icon className="size-6 text-primary" />
                <span className="text-sm font-medium">{link.title}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {!hasAnyContent ? (
        <EmptyState
          icon={FileQuestion}
          title="Ainda não há conteúdo publicado"
          description="Assim que novos conteúdos forem publicados, eles aparecerão aqui."
        />
      ) : (
        <>
          <section className="flex flex-col gap-4">
            <SectionHeader title="Conteúdos recentes" href="/tecnologia" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recent.slice(0, 3).map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </section>

          {mostLiked.length > 0 && (
            <section className="flex flex-col gap-4">
              <SectionHeader title="Mais curtidos" href="/tecnologia?sort=popular" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {mostLiked.slice(0, 3).map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </section>
          )}

          {videos.length > 0 && (
            <section className="flex flex-col gap-4">
              <SectionHeader title="Últimos vídeos" href="/videos" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {videos.slice(0, 3).map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </section>
          )}

          {podcasts.length > 0 && (
            <section className="flex flex-col gap-4">
              <SectionHeader title="Últimos podcasts" href="/podcasts" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {podcasts.slice(0, 3).map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </section>
          )}

          {topics.length > 0 && (
            <section className="flex flex-col gap-4">
              <SectionHeader title="Tópicos recentes do fórum" href="/forum" />
              <div className="flex flex-col gap-3">
                {topics.map((topic) => (
                  <TopicListItem key={topic.id} topic={topic} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
