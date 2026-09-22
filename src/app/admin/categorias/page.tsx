import type { Metadata } from "next";

import { categoryRepository } from "@/modules/categories/repository";
import { PageHeader } from "@/components/shared/page-header";
import { CategoryForm } from "@/components/admin/category-form";
import { CategoryRowActions } from "@/components/admin/category-row-actions";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { Folder } from "lucide-react";
import { MODULE_LABELS } from "@/lib/constants";

export const metadata: Metadata = { title: "Categorias | Administração" };

export default async function AdminCategoriesPage() {
  const categories = await categoryRepository.listAll();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Categorias" description="Categorias usadas em todos os módulos." />
      <CategoryForm />

      {categories.length === 0 ? (
        <EmptyState icon={Folder} title="Nenhuma categoria cadastrada" />
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Módulo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{MODULE_LABELS[category.module]}</Badge>
                  </TableCell>
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
