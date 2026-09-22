import { z } from "zod";

export const commentSchema = z.object({
  content: z.string().trim().min(1, "Escreva algo antes de enviar.").max(2000),
});
