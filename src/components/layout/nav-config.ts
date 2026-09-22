import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Home,
  Languages,
  MessagesSquare,
  Mic,
  ShieldCheck,
  Video,
  Cpu,
} from "lucide-react";

export type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
};

export type NavGroup = {
  label?: string;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    items: [{ title: "Home", url: "/", icon: Home }],
  },
  {
    label: "Explorar",
    items: [
      { title: "Tecnologia", url: "/tecnologia", icon: Cpu },
      { title: "Livros", url: "/livros", icon: BookOpen },
      { title: "Idiomas", url: "/idiomas", icon: Languages },
    ],
  },
  {
    label: "Mídia",
    items: [
      { title: "Vídeos", url: "/videos", icon: Video },
      { title: "Podcasts", url: "/podcasts", icon: Mic },
    ],
  },
  {
    label: "Comunidade",
    items: [{ title: "Fórum", url: "/forum", icon: MessagesSquare }],
  },
];

export const ADMIN_NAV_ITEM: NavItem = {
  title: "Administração",
  url: "/admin",
  icon: ShieldCheck,
};
