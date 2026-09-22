import { z } from "zod";

export const topicSchema = z.object({
  categoryId: z.string().min(1, "Selecione uma categoria."),
  title: z.string().trim().min(5, "O título deve ter ao menos 5 caracteres.").max(200),
  content: z.string().trim().min(10, "Escreva um pouco mais sobre o assunto.").max(10_000),
});

export const replySchema = z.object({
  content: z.string().trim().min(1, "Escreva uma resposta.").max(5000),
});
