import { getSessionUser } from "@/lib/session";
import { commentRepository } from "@/modules/comments/repository";
import { CommentForm } from "@/components/shared/comment-form";
import { CommentItem } from "@/components/shared/comment-item";
import { EmptyState } from "@/components/shared/empty-state";
import { MessageCircle } from "lucide-react";

export async function CommentSection({ postId, path }: { postId: string; path: string }) {
  const [user, { items, total }] = await Promise.all([
    getSessionUser(),
    commentRepository.listByPost(postId),
  ]);

  return (
    <section className="space-y-6">
      <h2 className="text-lg font-semibold">Comentários ({total})</h2>
      {user && <CommentForm postId={postId} path={path} />}
      {items.length === 0 ? (
        <EmptyState
          icon={MessageCircle}
          title="Nenhum comentário ainda"
          description="Seja a primeira pessoa a comentar."
        />
      ) : (
        <div className="space-y-5">
          {items.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              path={path}
              canModerate={user?.id === comment.user.id || user?.role === "ADMIN"}
            />
          ))}
        </div>
      )}
    </section>
  );
}
