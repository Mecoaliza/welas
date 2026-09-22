"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Lock, LockOpen, MoreVertical, Pin, PinOff, Trash2 } from "lucide-react";

import { deleteTopicAction, setTopicStatusAction } from "@/modules/forum/actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { ForumTopicStatus } from "@prisma/client";

export function TopicAdminMenu({
  topicId,
  status,
  path,
}: {
  topicId: string;
  status: ForumTopicStatus;
  path: string;
}) {
  const [isPending, startTransition] = useTransition();

  function updateStatus(next: ForumTopicStatus) {
    startTransition(async () => {
      try {
        await setTopicStatusAction(topicId, next, path);
      } catch {
        toast.error("Não foi possível atualizar o tópico.");
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteTopicAction(topicId);
      } catch {
        toast.error("Não foi possível excluir o tópico.");
      }
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="icon" disabled={isPending} />}>
        <MoreVertical className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {status === "PINNED" ? (
          <DropdownMenuItem onClick={() => updateStatus("OPEN")}>
            <PinOff /> Desafixar
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => updateStatus("PINNED")}>
            <Pin /> Fixar tópico
          </DropdownMenuItem>
        )}
        {status === "CLOSED" ? (
          <DropdownMenuItem onClick={() => updateStatus("OPEN")}>
            <LockOpen /> Reabrir
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => updateStatus("CLOSED")}>
            <Lock /> Fechar tópico
          </DropdownMenuItem>
        )}
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <DropdownMenuItem variant="destructive" onSelect={(e) => e.preventDefault()} />
            }
          >
            <Trash2 /> Excluir tópico
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir tópico?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação removerá o tópico e todas as respostas. Não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
