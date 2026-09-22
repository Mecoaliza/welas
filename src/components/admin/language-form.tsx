"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Plus } from "lucide-react";

import { createLanguageAction, type LanguageActionState } from "@/modules/languages/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: LanguageActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="size-4 animate-spin" /> : <Plus />}
      Adicionar
    </Button>
  );
}

export function LanguageForm() {
  const [state, formAction] = useActionState(createLanguageAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const prevStateRef = useRef(state);

  useEffect(() => {
    if (state !== prevStateRef.current) {
      prevStateRef.current = state;
      if (!state.error) formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium" htmlFor="name">
          Nome do idioma
        </label>
        <Input id="name" name="name" placeholder="Francês" required className="w-56" />
      </div>
      <SubmitButton />
      {state.error && <p className="w-full text-sm text-destructive">{state.error}</p>}
    </form>
  );
}
