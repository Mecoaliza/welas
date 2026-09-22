import { Suspense } from "react";
import { requireUser } from "@/lib/session";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <TooltipProvider delay={200}>
      <SidebarProvider>
        <AppSidebar
          user={{
            name: user.name,
            email: user.email,
            avatar: user.image,
            role: user.role,
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
