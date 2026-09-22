import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Nome muito curto").max(80),
  module: z.enum(["TECNOLOGIA", "LIVROS", "IDIOMAS", "FORUM"]),
});
