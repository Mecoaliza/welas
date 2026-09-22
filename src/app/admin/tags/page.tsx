import type { Metadata } from "next";
import { Tags } from "lucide-react";

import { tagRepository } from "@/modules/tags/repository";
import { PageHeader } from "@/components/shared/page-header";
import { TagRowActions } from "@/components/admin/tag-row-actions";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = { title: "Tags | Administração" };

export default async function AdminTagsPage() {
  const tags = await tagRepository.listAll();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Tags"
        description="Tags são criadas automaticamente ao publicar conteúdos. Remova as que não são mais usadas."
      />
      {tags.length === 0 ? (
        <EmptyState icon={Tags} title="Nenhuma tag cadastrada" />
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <div key={tag.id} className="flex items-center gap-1 rounded-full border py-0.5 pl-3 pr-1">
              <Badge variant="outline" className="border-none p-0">
                #{tag.name}
              </Badge>
              <TagRowActions id={tag.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
