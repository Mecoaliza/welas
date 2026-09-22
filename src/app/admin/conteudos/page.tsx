import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { PostStatus, PostType } from "@prisma/client";

import { postRepository } from "@/modules/posts/repository";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { PostRowActions } from "@/components/admin/post-row-actions";
import { MODULE_LABELS, POST_TYPE_LABELS } from "@/lib/constants";
import { FileText } from "lucide-react";

export const metadata: Metadata = { title: "Conteúdos | Administração" };

const STATUS_VARIANT: Record<PostStatus, "default" | "secondary" | "outline"> = {
  PUBLISHED: "default",
  DRAFT: "secondary",
  ARCHIVED: "outline",
};

const STATUS_LABEL: Record<PostStatus, string> = {
  PUBLISHED: "Publicado",
  DRAFT: "Rascunho",
  ARCHIVED: "Arquivado",
};

export default async function AdminContentsPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const type = params.tipo as PostType | undefined;

  const result = await postRepository.list({ allStatuses: true, type, page, pageSize: 20 });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Conteúdos"
        description="Artigos, vídeos e podcasts de Tecnologia, Livros e Idiomas."
        action={
          <Button render={<Link href="/admin/conteudos/novo" />}>
            <Plus /> Novo conteúdo
          </Button>
        }
      />

      {result.items.length === 0 ? (
        <EmptyState icon={FileText} title="Nenhum conteúdo cadastrado" />
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Módulo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Autor</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="max-w-xs truncate font-medium">{post.title}</TableCell>
                  <TableCell>{MODULE_LABELS[post.module]}</TableCell>
                  <TableCell>{POST_TYPE_LABELS[post.type]}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[post.status]}>{STATUS_LABEL[post.status]}</Badge>
                  </TableCell>
                  <TableCell>{post.author.name}</TableCell>
                  <TableCell>
                    <PostRowActions postId={post.id} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <PaginationBar page={result.page} pageCount={result.pageCount} />
    </div>
  );
}
