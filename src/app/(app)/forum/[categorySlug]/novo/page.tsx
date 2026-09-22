import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { forumRepository } from "@/modules/forum/repository";
import { PageHeader } from "@/components/shared/page-header";
import { NewTopicForm } from "@/components/forum/new-topic-form";

export const metadata: Metadata = { title: "Novo tópico" };

export default async function NewTopicPage({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}) {
  const { categorySlug } = await params;
  const category = await forumRepository.findCategoryBySlug(categorySlug);
  if (!category) notFound();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <PageHeader title="Novo tópico" description={`Publicando em ${category.name}`} />
      <NewTopicForm categoryId={category.id} categoryName={category.name} />
    </div>
  );
}
