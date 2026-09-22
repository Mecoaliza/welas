import type { Metadata } from "next";

import { categoryRepository } from "@/modules/categories/repository";
import { languageRepository } from "@/modules/languages/repository";
import { PageHeader } from "@/components/shared/page-header";
import { PostForm } from "@/components/admin/post-form";

export const metadata: Metadata = { title: "Novo conteúdo | Administração" };

export default async function NewPostPage() {
  const [categories, languages] = await Promise.all([
    categoryRepository.listAll(),
    languageRepository.listAll(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Novo conteúdo" />
      <PostForm categories={categories} languages={languages} />
    </div>
  );
}
