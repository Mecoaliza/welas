import type { Metadata } from "next";
import { Podcast } from "lucide-react";

import { postRepository } from "@/modules/posts/repository";
import { PageHeader } from "@/components/shared/page-header";
import { PostCard } from "@/components/shared/post-card";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = { title: "Podcasts" };

export default async function PodcastsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;

  const result = await postRepository.list({ type: "PODCAST", sort: "recent", page });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Podcasts" description="Biblioteca de podcasts da comunidade." />
      {result.items.length === 0 ? (
        <EmptyState
          icon={Podcast}
          title="Nenhum podcast encontrado"
          description="Ainda não há podcasts publicados."
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
