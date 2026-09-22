import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MessagesSquare, Plus } from "lucide-react";

import { forumRepository } from "@/modules/forum/repository";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { TopicListItem } from "@/components/forum/topic-list-item";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { EmptyState } from "@/components/shared/empty-state";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}): Promise<Metadata> {
  const { categorySlug } = await params;
  const category = await forumRepository.findCategoryBySlug(categorySlug);
  return { title: category?.name ?? "Fórum" };
}

export default async function ForumCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ categorySlug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { categorySlug } = await params;
  const { page: pageParam } = await searchParams;
  const category = await forumRepository.findCategoryBySlug(categorySlug);
  if (!category) notFound();

  const page = Number(pageParam) || 1;
  const result = await forumRepository.listTopics({ categorySlug, page });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={category.name}
        description="Tópicos de discussão desta categoria."
        action={
          <Button render={<Link href={`/forum/${categorySlug}/novo`} />}>
            <Plus /> Novo tópico
          </Button>
        }
      />
      {result.items.length === 0 ? (
        <EmptyState
          icon={MessagesSquare}
          title="Nenhum tópico ainda"
          description="Seja a primeira pessoa a iniciar uma discussão aqui."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {result.items.map((topic) => (
            <TopicListItem key={topic.id} topic={topic} />
          ))}
        </div>
      )}
      <PaginationBar page={result.page} pageCount={result.pageCount} />
    </div>
  );
}
