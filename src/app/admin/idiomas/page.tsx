import type { Metadata } from "next";
import { Languages } from "lucide-react";

import { languageRepository } from "@/modules/languages/repository";
import { PageHeader } from "@/components/shared/page-header";
import { LanguageForm } from "@/components/admin/language-form";
import { LanguageRowActions } from "@/components/admin/language-row-actions";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = { title: "Idiomas | Administração" };

export default async function AdminLanguagesPage() {
  const languages = await languageRepository.listAll();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Idiomas"
        description="Idiomas disponíveis no módulo Idiomas. Adicione novos livremente."
      />
      <LanguageForm />

      {languages.length === 0 ? (
        <EmptyState icon={Languages} title="Nenhum idioma cadastrado" />
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {languages.map((language) => (
                <TableRow key={language.id}>
                  <TableCell className="font-medium">{language.name}</TableCell>
                  <TableCell className="text-right">
                    <LanguageRowActions id={language.id} />
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
