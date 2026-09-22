import { Suspense } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <TooltipProvider delay={200}>
      <SidebarProvider>
        <AppSidebar
          user={{
            name: session.user.name ?? "Usuário",
            email: session.user.email ?? "",
            avatar: session.user.image ?? null,
            role: session.user.role,
          }}
        />
        <SidebarInset>
          <Suspense>
            <AppHeader />
          </Suspense>
          <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
