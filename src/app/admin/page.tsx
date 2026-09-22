import type { Metadata } from "next";
import Link from "next/link";

import { getDashboardStats } from "@/modules/admin/service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MODULE_LABELS } from "@/lib/constants";

export const metadata: Metadata = { title: "Dashboard | Administração" };

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  const cards = [
    { label: "Usuários cadastrados", value: stats.totalUsers },
    { label: "Publicações", value: `${stats.totalPublishedPosts} / ${stats.totalPosts}` },
    { label: "Comentários", value: stats.totalComments },
    { label: "Tópicos no fórum", value: stats.totalTopics },
    { label: "Respostas no fórum", value: stats.totalReplies },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {card.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">{card.value}</CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Publicações por módulo</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            {stats.postsByModule.map((row) => (
              <div key={row.module} className="flex justify-between">
                <span className="text-muted-foreground">
                  {MODULE_LABELS[row.module as keyof typeof MODULE_LABELS]}
                </span>
                <span className="font-medium">{row._count._all}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Mais acessados</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            {stats.topViewed.map((post) => (
              <Link
                key={post.id}
                href={`/admin/conteudos/${post.id}`}
                className="flex justify-between gap-2 hover:text-primary"
              >
                <span className="truncate">{post.title}</span>
                <span className="shrink-0 text-muted-foreground">{post.viewCount}</span>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Mais curtidos</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            {stats.topLiked.map((post) => (
              <Link
                key={post.id}
                href={`/admin/conteudos/${post.id}`}
                className="flex justify-between gap-2 hover:text-primary"
              >
                <span className="truncate">{post.title}</span>
                <span className="shrink-0 text-muted-foreground">{post._count.likes}</span>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
