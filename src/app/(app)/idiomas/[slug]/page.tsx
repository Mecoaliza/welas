import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { postRepository } from "@/modules/posts/repository";
import { PostDetail } from "@/components/shared/post-detail";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await postRepository.findBySlug(slug);
  return { title: post?.title ?? "Conteúdo" };
}

export default async function IdiomasPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await postRepository.findBySlug(slug);

  if (!post || post.module !== "IDIOMAS" || post.status !== "PUBLISHED") {
    notFound();
  }

  await postRepository.incrementViews(post.id);

  return <PostDetail post={post} path={`/idiomas/${slug}`} />;
}
