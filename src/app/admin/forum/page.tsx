import type { Metadata } from "next";
import Link from "next/link";
import { MessagesSquare } from "lucide-react";

import { forumRepository } from "@/modules/forum/repository";
import { PageHeader } from "@/components/shared/page-header";
import { ForumCategoryForm } from "@/components/admin/forum-category-form";
import { CategoryRowActions } from "@/components/admin/category-row-actions";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = { title: "Fórum | Administração" };

export default async function AdminForumPage() {
  const categories = await forumRepository.listCategories();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Fórum"
        description="Gerencie as categorias do fórum. Para moderar tópicos (fixar, fechar ou excluir), acesse o tópico diretamente."
      />
      <ForumCategoryForm />

      {categories.length === 0 ? (
        <EmptyState icon={MessagesSquare} title="Nenhuma categoria cadastrada" />
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tópicos</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">
                    <Link href={`/forum/${category.slug}`} className="hover:text-primary">
                      {category.name}
                    </Link>
                  </TableCell>
                  <TableCell>{category._count.forumTopics}</TableCell>
                  <TableCell className="text-right">
                    <CategoryRowActions id={category.id} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
