import { z } from "zod";

export const postSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(3, "Título muito curto").max(200),
  summary: z.string().trim().max(500).optional().or(z.literal("")),
  content: z.string().trim().min(1, "O conteúdo não pode ficar vazio"),
  coverImage: z.string().trim().url("URL de imagem inválida").optional().or(z.literal("")),
  type: z.enum(["ARTICLE", "VIDEO", "PODCAST"]),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  module: z.enum(["TECNOLOGIA", "LIVROS", "IDIOMAS"]),
  bookAuthor: z.string().trim().max(200).optional().or(z.literal("")),
  categoryId: z.string().trim().optional().or(z.literal("")),
  languageId: z.string().trim().optional().or(z.literal("")),
  tags: z.string().trim().optional().or(z.literal("")),
  mediaUrl: z.string().trim().url("URL de mídia inválida").optional().or(z.literal("")),
  mediaThumbnail: z.string().trim().url("URL de thumbnail inválida").optional().or(z.literal("")),
  mediaDuration: z.coerce.number().int().positive().optional(),
});

export type PostInput = z.infer<typeof postSchema>;
