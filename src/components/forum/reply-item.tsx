"use client";

import { useState, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MoreHorizontal, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";

import { deleteReplyAction, updateReplyAction } from "@/modules/forum/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
}

export type ReplyItemData = {
  id: string;
  content: string;
  createdAt: Date;
  user: { id: string; name: string; avatar: string | null };
};

export function ReplyItem({
  reply,
  path,
  canModerate,
}: {
  reply: ReplyItemData;
  path: string;
  canModerate: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(reply.content);
  const [isPending, startTransition] = useTransition();

  function handleUpdate() {
    startTransition(async () => {
      try {
        await updateReplyAction(reply.id, path, content);
        setIsEditing(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao editar resposta.");
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteReplyAction(reply.id, path);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao excluir resposta.");
      }
    });
  }

  return (
    <div className="flex gap-3 border-b pb-4 last:border-b-0">
      <Avatar className="size-8">
        <AvatarImage src={reply.user.avatar ?? undefined} alt={reply.user.name} />
        <AvatarFallback>{initials(reply.user.name)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-medium">{reply.user.name}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(reply.createdAt, { addSuffix: true, locale: ptBR })}
            </span>
          </div>
          {canModerate && !isEditing && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="ghost" size="icon" className="size-6" />}
              >
                <MoreHorizontal className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Pencil /> Editar
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onClick={handleDelete}>
                  <Trash2 /> Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        {isEditing ? (
          <div className="space-y-2">
            <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={3} />
            <div className="flex gap-2">
              <Button size="sm" disabled={isPending} onClick={handleUpdate}>
                Salvar
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-sm text-foreground/90">{reply.content}</p>
        )}
      </div>
    </div>
  );
}
