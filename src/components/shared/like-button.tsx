"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";

import { togglePostLikeAction, toggleTopicLikeAction } from "@/modules/likes/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Target = { kind: "post"; id: string } | { kind: "topic"; id: string };

export function LikeButton({
  target,
  initialLiked,
  initialCount,
  path,
  size = "default",
}: {
  target: Target;
  initialLiked: boolean;
  initialCount: number;
  path?: string;
  size?: "default" | "sm";
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const nextLiked = !liked;
    setLiked(nextLiked);
    setCount((c) => c + (nextLiked ? 1 : -1));

    startTransition(async () => {
      try {
        const action = target.kind === "post" ? togglePostLikeAction : toggleTopicLikeAction;
        await action(target.id, path);
      } catch {
        setLiked(!nextLiked);
        setCount((c) => c + (nextLiked ? -1 : 1));
        toast.error("Não foi possível registrar sua curtida. Faça login e tente novamente.");
      }
    });
  }

  return (
    <Button
      type="button"
      variant={liked ? "secondary" : "outline"}
      size={size === "sm" ? "sm" : "default"}
      disabled={isPending}
      onClick={handleClick}
      className={cn(liked && "text-primary")}
    >
      <Heart className={cn("size-4", liked && "fill-current")} />
      {count}
    </Button>
  );
}
