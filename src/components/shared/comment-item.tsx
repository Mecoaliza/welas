"use client";

import { useState, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MoreHorizontal, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";

import { deleteCommentAction, updateCommentAction } from "@/modules/comments/actions";
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

export type CommentItemData = {
  id: string;
  content: string;
  createdAt: Date;
  user: { id: string; name: string; avatar: string | null };
};

export function CommentItem({
  comment,
  path,
  canModerate,
}: {
  comment: CommentItemData;
  path: string;
  canModerate: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(comment.content);
  const [isPending, startTransition] = useTransition();

  function handleUpdate() {
    startTransition(async () => {
      try {
        await updateCommentAction(comment.id, path, content);
        setIsEditing(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao editar comentário.");
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteCommentAction(comment.id, path);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Erro ao excluir comentário.");
      }
    });
  }

  return (
    <div className="flex gap-3">
      <Avatar className="size-8">
        <AvatarImage src={comment.user.avatar ?? undefined} alt={comment.user.name} />
        <AvatarFallback>{initials(comment.user.name)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-medium">{comment.user.name}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(comment.createdAt, { addSuffix: true, locale: ptBR })}
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
            <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={2} />
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
          <p className="text-sm text-foreground/90 whitespace-pre-wrap">{comment.content}</p>
        )}
      </div>
    </div>
  );
}
