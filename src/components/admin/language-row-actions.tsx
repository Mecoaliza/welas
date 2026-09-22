"use client";

import { deleteLanguageAction } from "@/modules/languages/actions";
import { DeleteButton } from "@/components/admin/delete-button";

export function LanguageRowActions({ id }: { id: string }) {
  return (
    <DeleteButton
      onDelete={() => deleteLanguageAction(id)}
      title="Excluir idioma?"
      description="Só é possível excluir idiomas que não estão em uso."
    />
  );
}
