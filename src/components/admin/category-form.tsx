"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Plus } from "lucide-react";

import { createCategoryAction, type CategoryActionState } from "@/modules/categories/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MODULE_LABELS } from "@/lib/constants";

const MODULE_OPTIONS = Object.entries(MODULE_LABELS).map(([value, label]) => ({ value, label }));

const initialState: CategoryActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="size-4 animate-spin" /> : <Plus />}
      Adicionar
    </Button>
  );
}

export function CategoryForm() {
  const [state, formAction] = useActionState(createCategoryAction, initialState);
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
          Nome da categoria
        </label>
        <Input id="name" name="name" required className="w-56" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Módulo</label>
        <Select name="module" items={MODULE_OPTIONS} defaultValue="TECNOLOGIA">
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MODULE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <SubmitButton />
      {state.error && <p className="w-full text-sm text-destructive">{state.error}</p>}
    </form>
  );
}
