import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquare } from "lucide-react";

import { commentRepository } from "@/modules/comments/repository";
import { PageHeader } from "@/components/shared/page-header";
import { CommentRowActions } from "@/components/admin/comment-row-actions";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { MODULE_ROUTES } from "@/lib/constants";

export const metadata: Metadata = { title: "Comentários | Administração" };

export default async function AdminCommentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Number(pageParam) || 1;
  const result = await commentRepository.listAllForAdmin(page);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Comentários" description="Modere comentários de todos os conteúdos." />

      {result.items.length === 0 ? (
        <EmptyState icon={MessageSquare} title="Nenhum comentário ainda" />
      ) : (
        <div className="flex flex-col gap-3">
          {result.items.map((comment) => (
            <div key={comment.id} className="flex items-start justify-between gap-4 rounded-lg border p-4">
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{comment.user.name}</span> em{" "}
                  <Link
                    href={`${MODULE_ROUTES[comment.post.module]}/${comment.post.slug}`}
                    className="hover:text-primary"
                  >
                    {comment.post.title}
                  </Link>
                </p>
                <p className="line-clamp-2 text-sm">{comment.content}</p>
              </div>
              <CommentRowActions id={comment.id} />
            </div>
          ))}
        </div>
      )}
      <PaginationBar page={result.page} pageCount={result.pageCount} />
    </div>
  );
}
