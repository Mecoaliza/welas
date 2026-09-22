"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import type { Role } from "@prisma/client";

import { deleteUserAction, updateUserRoleAction } from "@/modules/users/actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DeleteButton } from "@/components/admin/delete-button";

const ROLE_OPTIONS = [
  { value: "USER", label: "Usuário" },
  { value: "ADMIN", label: "Admin" },
];

export function UserRowActions({
  userId,
  role,
  isSelf,
}: {
  userId: string;
  role: Role;
  isSelf: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleRoleChange(value: string | null) {
    if (!value) return;
    startTransition(async () => {
      try {
        await updateUserRoleAction(userId, value as Role);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao atualizar papel.");
      }
    });
  }

  if (isSelf) {
    return <span className="text-xs text-muted-foreground">Você</span>;
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Select items={ROLE_OPTIONS} value={role} onValueChange={handleRoleChange} disabled={isPending}>
        <SelectTrigger className="w-28">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ROLE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <DeleteButton
        onDelete={() => deleteUserAction(userId)}
        title="Excluir usuário?"
        description="Só é possível excluir usuários que não publicaram conteúdos."
      />
    </div>
  );
}
