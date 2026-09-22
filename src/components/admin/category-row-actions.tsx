"use client";

import { deleteCategoryAction } from "@/modules/categories/actions";
import { DeleteButton } from "@/components/admin/delete-button";

export function CategoryRowActions({ id }: { id: string }) {
  return (
    <DeleteButton
      onDelete={() => deleteCategoryAction(id)}
      title="Excluir categoria?"
      description="Só é possível excluir categorias que não estão em uso."
    />
  );
}
