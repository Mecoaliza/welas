import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata: Metadata = { title: "Acesso negado" };

export default function AccessDeniedPage() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <EmptyState
        icon={ShieldAlert}
        title="Acesso negado"
        description="Você não tem permissão para acessar esta área."
        action={
          <Button render={<Link href="/" />}>Voltar para a home</Button>
        }
      />
    </div>
  );
}
