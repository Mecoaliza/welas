"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { registerAction, type ActionState } from "@/modules/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
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
      Criar conta
    </Button>
  );
}

export function RegisterForm() {
  const [state, formAction] = useActionState(registerAction, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar conta</CardTitle>
        <CardDescription>Junte-se à comunidade ConectaX.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <FieldGroup>
            <Field data-invalid={!!state.fieldErrors?.name}>
              <FieldLabel htmlFor="name">Nome</FieldLabel>
              <Input id="name" name="name" autoComplete="name" required />
              <FieldError errors={state.fieldErrors?.name?.map((message) => ({ message }))} />
            </Field>
            <Field data-invalid={!!state.fieldErrors?.email}>
              <FieldLabel htmlFor="email">E-mail</FieldLabel>
              <Input id="email" name="email" type="email" autoComplete="email" required />
              <FieldError errors={state.fieldErrors?.email?.map((message) => ({ message }))} />
            </Field>
            <Field data-invalid={!!state.fieldErrors?.password}>
              <FieldLabel htmlFor="password">Senha</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
              />
              <FieldError errors={state.fieldErrors?.password?.map((message) => ({ message }))} />
            </Field>
            <Field data-invalid={!!state.fieldErrors?.confirmPassword}>
              <FieldLabel htmlFor="confirmPassword">Confirmar senha</FieldLabel>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
              />
              <FieldError
                errors={state.fieldErrors?.confirmPassword?.map((message) => ({ message }))}
              />
            </Field>
            {state.error && <p className="text-sm text-destructive">{state.error}</p>}
            <SubmitButton />
          </FieldGroup>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Já tem uma conta?{" "}
          <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
            Entrar
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
