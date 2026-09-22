import type { Metadata } from "next";
import { Video } from "lucide-react";

import { postRepository } from "@/modules/posts/repository";
import { PageHeader } from "@/components/shared/page-header";
import { PostCard } from "@/components/shared/post-card";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = { title: "Vídeos" };

export default async function VideosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;

  const result = await postRepository.list({ type: "VIDEO", sort: "recent", page });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Vídeos" description="Biblioteca de vídeos da comunidade." />
      {result.items.length === 0 ? (
        <EmptyState
          icon={Video}
          title="Nenhum vídeo encontrado"
          description="Ainda não há vídeos publicados."
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
