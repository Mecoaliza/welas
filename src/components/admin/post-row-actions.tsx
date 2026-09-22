"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";

import { deletePostAction } from "@/modules/posts/actions";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/admin/delete-button";

export function PostRowActions({ postId }: { postId: string }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="icon"
        render={<Link href={`/admin/conteudos/${postId}`} />}
      >
        <Pencil className="size-4" />
      </Button>
      <DeleteButton
        onDelete={() => deletePostAction(postId)}
        title="Excluir conteúdo?"
        description="O conteúdo, seus comentários e curtidas serão removidos permanentemente."
      />
    </div>
  );
}
