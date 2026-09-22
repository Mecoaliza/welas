import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";

import { globalSearch, type SearchFilter } from "@/modules/search/service";
import { PageHeader } from "@/components/shared/page-header";
import { PostCard } from "@/components/shared/post-card";
import { TopicListItem } from "@/components/forum/topic-list-item";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Buscar" };

const FILTERS: { value: SearchFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "TECNOLOGIA", label: "Tecnologia" },
  { value: "LIVROS", label: "Livros" },
  { value: "IDIOMAS", label: "Idiomas" },
  { value: "FORUM", label: "Fórum" },
];

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; modulo?: string }>;
}) {
  const { q = "", modulo } = await searchParams;
  const filter = (FILTERS.some((f) => f.value === modulo) ? modulo : "all") as SearchFilter;

  const { posts, topics } = q ? await globalSearch(q, filter) : { posts: [], topics: [] };
  const hasResults = posts.length > 0 || topics.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Buscar"
        description={q ? `Resultados para "${q}"` : "Digite algo na barra de pesquisa acima."}
      />

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link key={f.value} href={`/buscar?q=${encodeURIComponent(q)}&modulo=${f.value}`}>
            <Badge
              variant={filter === f.value ? "default" : "outline"}
              className={cn("cursor-pointer", filter === f.value && "bg-primary")}
            >
              {f.label}
            </Badge>
          </Link>
        ))}
      </div>

      {!q ? null : !hasResults ? (
        <EmptyState
          icon={Search}
          title="Nenhum resultado encontrado"
          description="Tente palavras-chave diferentes ou remova os filtros."
        />
      ) : (
        <div className="flex flex-col gap-8">
          {posts.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Conteúdos ({posts.length})
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </section>
          )}
          {topics.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Fórum ({topics.length})
              </h2>
              <div className="flex flex-col gap-3">
                {topics.map((topic) => (
                  <TopicListItem key={topic.id} topic={topic} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
