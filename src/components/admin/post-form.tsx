"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

import { createPostAction, updatePostAction } from "@/modules/posts/actions";
import type { ActionState } from "@/modules/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import "@uiw/react-md-editor/markdown-editor.css";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

type CategoryOption = { id: string; name: string; module: string };
type LanguageOption = { id: string; name: string };

type PostFormValues = {
  id?: string;
  title: string;
  summary: string;
  content: string;
  coverImage: string;
  type: "ARTICLE" | "VIDEO" | "PODCAST";
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  module: "TECNOLOGIA" | "LIVROS" | "IDIOMAS";
  bookAuthor: string;
  categoryId: string;
  languageId: string;
  tags: string;
  mediaUrl: string;
  mediaThumbnail: string;
  mediaDuration: string;
};

const EMPTY_VALUES: PostFormValues = {
  title: "",
  summary: "",
  content: "",
  coverImage: "",
  type: "ARTICLE",
  status: "DRAFT",
  module: "TECNOLOGIA",
  bookAuthor: "",
  categoryId: "",
  languageId: "",
  tags: "",
  mediaUrl: "",
  mediaThumbnail: "",
  mediaDuration: "",
};

const initialState: ActionState = {};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="size-4 animate-spin" />}
      {label}
    </Button>
  );
}

export function PostForm({
  defaultValues,
  categories,
  languages,
}: {
  defaultValues?: Partial<PostFormValues> & { id?: string };
  categories: CategoryOption[];
  languages: LanguageOption[];
}) {
  const isEditing = Boolean(defaultValues?.id);
  const action = isEditing ? updatePostAction : createPostAction;
  const [state, formAction] = useActionState(action, initialState);

  const [values, setValues] = useState<PostFormValues>({ ...EMPTY_VALUES, ...defaultValues });

  const filteredCategories = useMemo(
    () => categories.filter((c) => c.module === values.module),
    [categories, values.module]
  );

  function set<K extends keyof PostFormValues>(key: K, value: PostFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <form action={formAction}>
      {values.id && <input type="hidden" name="id" value={values.id} />}
      <input type="hidden" name="content" value={values.content} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardContent className="pt-6">
              <FieldGroup>
                <Field data-invalid={!!state.fieldErrors?.title}>
                  <FieldLabel htmlFor="title">Título</FieldLabel>
                  <Input
                    id="title"
                    name="title"
                    required
                    value={values.title}
                    onChange={(e) => set("title", e.target.value)}
                  />
                  <FieldError errors={state.fieldErrors?.title?.map((message) => ({ message }))} />
                </Field>
                <Field data-invalid={!!state.fieldErrors?.summary}>
                  <FieldLabel htmlFor="summary">Resumo</FieldLabel>
                  <Textarea
                    id="summary"
                    name="summary"
                    rows={2}
                    maxLength={500}
                    value={values.summary}
                    onChange={(e) => set("summary", e.target.value)}
                  />
                  <FieldError errors={state.fieldErrors?.summary?.map((message) => ({ message }))} />
                </Field>
                <Field data-invalid={!!state.fieldErrors?.content}>
                  <FieldLabel>Conteúdo</FieldLabel>
                  <div data-color-mode="light">
                    <MDEditor
                      value={values.content}
                      onChange={(value) => set("content", value ?? "")}
                      height={400}
                      preview="edit"
                    />
                  </div>
                  <FieldError errors={state.fieldErrors?.content?.map((message) => ({ message }))} />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          {values.type !== "ARTICLE" && (
            <Card>
              <CardContent className="flex flex-col gap-4 pt-6">
                <h3 className="text-sm font-medium">
                  Mídia ({values.type === "VIDEO" ? "vídeo" : "podcast"})
                </h3>
                <FieldGroup>
                  <Field data-invalid={!!state.fieldErrors?.mediaUrl}>
                    <FieldLabel htmlFor="mediaUrl">URL da mídia</FieldLabel>
                    <Input
                      id="mediaUrl"
                      name="mediaUrl"
                      placeholder="https://youtube.com/watch?v=... ou link direto"
                      value={values.mediaUrl}
                      onChange={(e) => set("mediaUrl", e.target.value)}
                    />
                    <FieldError
                      errors={state.fieldErrors?.mediaUrl?.map((message) => ({ message }))}
                    />
                  </Field>
                  {values.type === "VIDEO" && (
                    <Field>
                      <FieldLabel htmlFor="mediaThumbnail">Thumbnail (opcional)</FieldLabel>
                      <Input
                        id="mediaThumbnail"
                        name="mediaThumbnail"
                        value={values.mediaThumbnail}
                        onChange={(e) => set("mediaThumbnail", e.target.value)}
                      />
                    </Field>
                  )}
                  <Field>
                    <FieldLabel htmlFor="mediaDuration">Duração em segundos (opcional)</FieldLabel>
                    <Input
                      id="mediaDuration"
                      name="mediaDuration"
                      type="number"
                      min={1}
                      value={values.mediaDuration}
                      onChange={(e) => set("mediaDuration", e.target.value)}
                    />
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardContent className="flex flex-col gap-4 pt-6">
              <Field>
                <FieldLabel>Módulo</FieldLabel>
                <Select
                  name="module"
                  value={values.module}
                  onValueChange={(value) => set("module", value as PostFormValues["module"])}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TECNOLOGIA">Tecnologia</SelectItem>
                    <SelectItem value="LIVROS">Livros</SelectItem>
                    <SelectItem value="IDIOMAS">Idiomas</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>Tipo de conteúdo</FieldLabel>
                <Select
                  name="type"
                  value={values.type}
                  onValueChange={(value) => set("type", value as PostFormValues["type"])}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ARTICLE">Artigo</SelectItem>
                    <SelectItem value="VIDEO">Vídeo</SelectItem>
                    <SelectItem value="PODCAST">Podcast</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>Status</FieldLabel>
                <Select
                  name="status"
                  value={values.status}
                  onValueChange={(value) => set("status", value as PostFormValues["status"])}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Rascunho</SelectItem>
                    <SelectItem value="PUBLISHED">Publicado</SelectItem>
                    <SelectItem value="ARCHIVED">Arquivado</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>Categoria</FieldLabel>
                <Select
                  name="categoryId"
                  value={values.categoryId || undefined}
                  onValueChange={(value) => set("categoryId", value ?? "")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sem categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              {values.module === "IDIOMAS" && (
                <Field>
                  <FieldLabel>Idioma</FieldLabel>
                  <Select
                    name="languageId"
                    value={values.languageId || undefined}
                    onValueChange={(value) => set("languageId", value ?? "")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o idioma" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((language) => (
                        <SelectItem key={language.id} value={language.id}>
                          {language.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}

              {values.module === "LIVROS" && (
                <Field>
                  <FieldLabel htmlFor="bookAuthor">Autor do livro</FieldLabel>
                  <Input
                    id="bookAuthor"
                    name="bookAuthor"
                    value={values.bookAuthor}
                    onChange={(e) => set("bookAuthor", e.target.value)}
                  />
                </Field>
              )}

              <Field>
                <FieldLabel htmlFor="coverImage">URL da imagem de capa</FieldLabel>
                <Input
                  id="coverImage"
                  name="coverImage"
                  placeholder="https://..."
                  value={values.coverImage}
                  onChange={(e) => set("coverImage", e.target.value)}
                />
                <FieldError errors={state.fieldErrors?.coverImage?.map((message) => ({ message }))} />
              </Field>

              <Field>
                <FieldLabel htmlFor="tags">Tags (separadas por vírgula)</FieldLabel>
                <Input
                  id="tags"
                  name="tags"
                  placeholder="python, ia, carreira"
                  value={values.tags}
                  onChange={(e) => set("tags", e.target.value)}
                />
              </Field>
            </CardContent>
          </Card>

          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <SubmitButton label={isEditing ? "Salvar alterações" : "Criar conteúdo"} />
        </div>
      </div>
    </form>
  );
}
