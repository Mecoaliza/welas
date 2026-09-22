"use client";

import { deleteTagAction } from "@/modules/tags/actions";
import { DeleteButton } from "@/components/admin/delete-button";

export function TagRowActions({ id }: { id: string }) {
  return (
    <DeleteButton
      onDelete={() => deleteTagAction(id)}
      title="Excluir tag?"
      description="A tag será removida de todos os conteúdos que a utilizam."
    />
  );
}
