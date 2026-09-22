import type { Metadata } from "next";
import { FolderOpen } from "lucide-react";

import { postRepository } from "@/modules/posts/repository";
import { categoryRepository } from "@/modules/categories/repository";
import { languageRepository } from "@/modules/languages/repository";
import { PageHeader } from "@/components/shared/page-header";
import { PostFilters } from "@/components/shared/post-filters";
import { PostCard } from "@/components/shared/post-card";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = { title: "Idiomas" };

const SORT_OPTIONS = [
  { value: "recent", label: "Mais recentes" },
  { value: "popular", label: "Mais curtidos" },
  { value: "views", label: "Mais acessados" },
];

export default async function IdiomasPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; idioma?: string; sort?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;

  const [categories, languages, result] = await Promise.all([
    categoryRepository.listByModule("IDIOMAS"),
    languageRepository.listAll(),
    postRepository.list({
      module: "IDIOMAS",
      categorySlug: params.categoria,
      languageSlug: params.idioma,
      sort: (params.sort as "recent" | "popular" | "views") ?? "recent",
      page,
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Idiomas"
        description="Vocabulário, gramática, pronúncia e materiais de estudo."
      />
      <PostFilters
        categories={categories.map((c) => ({ value: c.slug, label: c.name }))}
        languages={languages.map((l) => ({ value: l.slug, label: l.name }))}
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
