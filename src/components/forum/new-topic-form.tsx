"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

import { createTopicAction } from "@/modules/forum/actions";
import type { ActionState } from "@/modules/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Card, CardContent } from "@/components/ui/card";

const initialState: ActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="size-4 animate-spin" />}
      Publicar tópico
    </Button>
  );
}

export function NewTopicForm({
  categoryId,
  categoryName,
}: {
  categoryId: string;
  categoryName: string;
}) {
  const [state, formAction] = useActionState(createTopicAction, initialState);

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={formAction}>
          <input type="hidden" name="categoryId" value={categoryId} />
          <FieldGroup>
            <Field>
              <FieldLabel>Categoria</FieldLabel>
              <Input value={categoryName} disabled />
            </Field>
            <Field data-invalid={!!state.fieldErrors?.title}>
              <FieldLabel htmlFor="title">Título</FieldLabel>
              <Input id="title" name="title" required maxLength={200} />
              <FieldError errors={state.fieldErrors?.title?.map((message) => ({ message }))} />
            </Field>
            <Field data-invalid={!!state.fieldErrors?.content}>
              <FieldLabel htmlFor="content">Conteúdo</FieldLabel>
              <Textarea id="content" name="content" required rows={8} />
              <FieldError errors={state.fieldErrors?.content?.map((message) => ({ message }))} />
            </Field>
            {state.error && <p className="text-sm text-destructive">{state.error}</p>}
            <div>
              <SubmitButton />
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
