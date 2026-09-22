"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { updateProfileAction } from "@/modules/users/actions";
import type { ActionState } from "@/modules/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";

const initialState: ActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="size-4 animate-spin" />}
      Salvar alterações
    </Button>
  );
}

export function ProfileForm({
  defaultValues,
}: {
  defaultValues: { name: string; avatar: string; bio: string };
}) {
  const [state, formAction] = useActionState(updateProfileAction, initialState);

  useEffect(() => {
    if (state.success) toast.success("Perfil atualizado com sucesso.");
  }, [state.success]);

  return (
    <form action={formAction}>
      <FieldGroup>
        <Field data-invalid={!!state.fieldErrors?.name}>
          <FieldLabel htmlFor="name">Nome</FieldLabel>
          <Input id="name" name="name" defaultValue={defaultValues.name} required />
          <FieldError errors={state.fieldErrors?.name?.map((message) => ({ message }))} />
        </Field>
        <Field data-invalid={!!state.fieldErrors?.avatar}>
          <FieldLabel htmlFor="avatar">URL do avatar</FieldLabel>
          <Input
            id="avatar"
            name="avatar"
            type="url"
            placeholder="https://..."
            defaultValue={defaultValues.avatar}
          />
          <FieldError errors={state.fieldErrors?.avatar?.map((message) => ({ message }))} />
        </Field>
        <Field data-invalid={!!state.fieldErrors?.bio}>
          <FieldLabel htmlFor="bio">Bio</FieldLabel>
          <Textarea id="bio" name="bio" rows={3} maxLength={300} defaultValue={defaultValues.bio} />
          <FieldError errors={state.fieldErrors?.bio?.map((message) => ({ message }))} />
        </Field>
        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        <div>
          <SubmitButton />
        </div>
      </FieldGroup>
    </form>
  );
}
