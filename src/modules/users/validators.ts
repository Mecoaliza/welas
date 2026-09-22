import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome completo").max(120),
  avatar: z.string().trim().url("URL de imagem inválida").optional().or(z.literal("")),
  bio: z.string().trim().max(300, "A bio deve ter no máximo 300 caracteres").optional().or(z.literal("")),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Informe sua senha atual"),
    newPassword: z.string().min(8, "A nova senha deve ter ao menos 8 caracteres").max(128),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });
