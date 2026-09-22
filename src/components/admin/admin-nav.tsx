"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  Folder,
  LayoutDashboard,
  MessageSquare,
  MessagesSquare,
  Podcast,
  Tags,
  Users,
  Video,
  Languages,
} from "lucide-react";

import { cn } from "@/lib/utils";

const ITEMS = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Conteúdos", href: "/admin/conteudos", icon: FileText },
  { title: "Vídeos", href: "/admin/conteudos?tipo=VIDEO", icon: Video },
  { title: "Podcasts", href: "/admin/conteudos?tipo=PODCAST", icon: Podcast },
  { title: "Categorias", href: "/admin/categorias", icon: Folder },
  { title: "Tags", href: "/admin/tags", icon: Tags },
  { title: "Idiomas", href: "/admin/idiomas", icon: Languages },
  { title: "Fórum", href: "/admin/forum", icon: MessagesSquare },
  { title: "Comentários", href: "/admin/comentarios", icon: MessageSquare },
  { title: "Usuários", href: "/admin/usuarios", icon: Users },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto border-b pb-px">
      {ITEMS.map((item) => {
        const base = item.href.split("?")[0];
        const isActive = pathname === base;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex shrink-0 items-center gap-1.5 border-b-2 border-transparent px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground",
              isActive && "border-primary text-foreground"
            )}
          >
            <item.icon className="size-4" />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
