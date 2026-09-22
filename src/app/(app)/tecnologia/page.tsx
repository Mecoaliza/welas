import type { Metadata } from "next";
import { FolderOpen } from "lucide-react";

import { postRepository } from "@/modules/posts/repository";
import { categoryRepository } from "@/modules/categories/repository";
import { PageHeader } from "@/components/shared/page-header";
import { PostFilters } from "@/components/shared/post-filters";
import { PostCard } from "@/components/shared/post-card";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = { title: "Tecnologia" };

const SORT_OPTIONS = [
  { value: "recent", label: "Mais recentes" },
  { value: "popular", label: "Mais curtidos" },
  { value: "views", label: "Mais acessados" },
];

export default async function TecnologiaPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; sort?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;

  const [categories, result] = await Promise.all([
    categoryRepository.listByModule("TECNOLOGIA"),
    postRepository.list({
      module: "TECNOLOGIA",
      categorySlug: params.categoria,
      sort: (params.sort as "recent" | "popular" | "views") ?? "recent",
      page,
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Tecnologia"
        description="Artigos, vídeos e podcasts sobre programação, IA, carreira e ferramentas."
      />
      <PostFilters
        categories={categories.map((c) => ({ value: c.slug, label: c.name }))}
        sortOptions={SORT_OPTIONS}
      />
      {result.items.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="Nenhum conteúdo encontrado"
          description="Ainda não há publicações para esse filtro."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {result.items.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
      <PaginationBar page={result.page} pageCount={result.pageCount} />
    </div>
  );
}
