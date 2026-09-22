import type { Metadata } from "next";
import Link from "next/link";
import { MessagesSquare } from "lucide-react";

import { forumRepository } from "@/modules/forum/repository";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = { title: "Fórum" };

export default async function ForumPage() {
  const categories = await forumRepository.listCategories();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Fórum"
        description="Tire dúvidas, discuta e compartilhe conhecimento com a comunidade."
      />
      {categories.length === 0 ? (
        <EmptyState
          icon={MessagesSquare}
          title="Nenhuma categoria criada"
          description="Peça a um administrador para criar categorias do fórum."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link key={category.id} href={`/forum/${category.slug}`}>
              <Card className="h-full transition-colors hover:border-primary/40">
                <CardHeader>
                  <CardTitle className="text-base">{category.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {category._count.forumTopics}{" "}
                    {category._count.forumTopics === 1 ? "tópico" : "tópicos"}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
