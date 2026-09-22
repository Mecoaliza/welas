import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { postRepository } from "@/modules/posts/repository";
import { categoryRepository } from "@/modules/categories/repository";
import { languageRepository } from "@/modules/languages/repository";
import { PageHeader } from "@/components/shared/page-header";
import { PostForm } from "@/components/admin/post-form";

export const metadata: Metadata = { title: "Editar conteúdo | Administração" };

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [post, categories, languages] = await Promise.all([
    postRepository.findById(id),
    categoryRepository.listAll(),
    languageRepository.listAll(),
  ]);

  if (!post) notFound();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Editar conteúdo" />
      <PostForm
        defaultValues={{
          id: post.id,
          title: post.title,
          summary: post.summary ?? "",
          content: post.content,
          coverImage: post.coverImage ?? "",
          type: post.type,
          status: post.status,
          module: post.module as "TECNOLOGIA" | "LIVROS" | "IDIOMAS",
          bookAuthor: post.bookAuthor ?? "",
          categoryId: post.category?.id ?? "",
          languageId: post.language?.id ?? "",
          tags: post.tags.map((t) => t.tag.name).join(", "),
          mediaUrl: post.media[0]?.url ?? "",
          mediaThumbnail: post.media[0]?.thumbnail ?? "",
          mediaDuration: post.media[0]?.duration?.toString() ?? "",
        }}
        categories={categories}
        languages={languages}
      />
    </div>
  );
}
