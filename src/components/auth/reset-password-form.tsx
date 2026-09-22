"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

import { resetPasswordAction, type ActionState } from "@/modules/auth/actions";
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
      Redefinir senha
    </Button>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction] = useActionState(resetPasswordAction, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Redefinir senha</CardTitle>
        <CardDescription>Escolha uma nova senha para sua conta.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <input type="hidden" name="token" value={token} />
          <FieldGroup>
            <Field data-invalid={!!state.fieldErrors?.password}>
              <FieldLabel htmlFor="password">Nova senha</FieldLabel>
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
              <FieldLabel htmlFor="confirmPassword">Confirmar nova senha</FieldLabel>
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
      </CardContent>
    </Card>
  );
}
