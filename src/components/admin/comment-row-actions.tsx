"use client";

import { deleteCommentAction } from "@/modules/comments/actions";
import { DeleteButton } from "@/components/admin/delete-button";

export function CommentRowActions({ id }: { id: string }) {
  return (
    <DeleteButton
      onDelete={() => deleteCommentAction(id, "/admin/comentarios")}
      title="Excluir comentário?"
    />
  );
}
