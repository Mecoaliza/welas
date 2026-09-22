"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { loginAction, type ActionState } from "@/modules/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const initialState: ActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && <Loader2 className="size-4 animate-spin" />}
      Entrar
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialState);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const justRegistered = searchParams.get("registered") === "1";
  const justReset = searchParams.get("reset") === "1";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Entrar</CardTitle>
        <CardDescription>Acesse sua conta na comunidade ConectaX.</CardDescription>
      </CardHeader>
      <CardContent>
        {justRegistered && (
          <p className="mb-4 rounded-md bg-accent px-3 py-2 text-sm text-accent-foreground">
            Cadastro realizado! Faça login para continuar.
          </p>
        )}
        {justReset && (
          <p className="mb-4 rounded-md bg-accent px-3 py-2 text-sm text-accent-foreground">
            Senha redefinida! Faça login com a nova senha.
          </p>
        )}
        <form action={formAction}>
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          <FieldGroup>
            <Field data-invalid={!!state.fieldErrors?.email}>
              <FieldLabel htmlFor="email">E-mail</FieldLabel>
              <Input id="email" name="email" type="email" autoComplete="email" required />
              <FieldError errors={state.fieldErrors?.email?.map((message) => ({ message }))} />
            </Field>
            <Field data-invalid={!!state.fieldErrors?.password}>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="password">Senha</FieldLabel>
                <Link
                  href="/forgot-password"
                  className="text-xs text-muted-foreground underline-offset-4 hover:underline"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
              <FieldError errors={state.fieldErrors?.password?.map((message) => ({ message }))} />
            </Field>
            {state.error && <p className="text-sm text-destructive">{state.error}</p>}
            <SubmitButton />
          </FieldGroup>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Não tem uma conta?{" "}
          <Link href="/register" className="font-medium text-primary underline-offset-4 hover:underline">
            Cadastre-se
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
