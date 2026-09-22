"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { changePasswordAction } from "@/modules/users/actions";
import type { ActionState } from "@/modules/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";

const initialState: ActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="size-4 animate-spin" />}
      Atualizar senha
    </Button>
  );
}

export function PasswordForm() {
  const [state, formAction] = useActionState(changePasswordAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      toast.success("Senha atualizada com sucesso.");
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction}>
      <FieldGroup>
        <Field data-invalid={!!state.fieldErrors?.currentPassword}>
          <FieldLabel htmlFor="currentPassword">Senha atual</FieldLabel>
          <Input id="currentPassword" name="currentPassword" type="password" required />
          <FieldError
            errors={state.fieldErrors?.currentPassword?.map((message) => ({ message }))}
          />
        </Field>
        <Field data-invalid={!!state.fieldErrors?.newPassword}>
          <FieldLabel htmlFor="newPassword">Nova senha</FieldLabel>
          <Input id="newPassword" name="newPassword" type="password" required />
          <FieldError errors={state.fieldErrors?.newPassword?.map((message) => ({ message }))} />
        </Field>
        <Field data-invalid={!!state.fieldErrors?.confirmPassword}>
          <FieldLabel htmlFor="confirmPassword">Confirmar nova senha</FieldLabel>
          <Input id="confirmPassword" name="confirmPassword" type="password" required />
          <FieldError
            errors={state.fieldErrors?.confirmPassword?.map((message) => ({ message }))}
          />
        </Field>
        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        <div>
          <SubmitButton />
        </div>
      </FieldGroup>
    </form>
  );
}
