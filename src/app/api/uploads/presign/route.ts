import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";

import { getSessionUser } from "@/lib/session";
import { ALLOWED_UPLOAD_TYPES, createPresignedUpload, isS3Configured } from "@/lib/s3";
import { RATE_LIMITS, rateLimit } from "@/lib/rate-limit";

const bodySchema = z.object({
  filename: z.string().min(1).max(200),
  contentType: z.enum(ALLOWED_UPLOAD_TYPES as [string, ...string[]]),
});

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "_").slice(-100);
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  // Same rule as the multipart upload route: only admins upload files.
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  if (!isS3Configured()) {
    return NextResponse.json(
      { error: "Armazenamento de arquivos não configurado. Use uma URL externa por enquanto." },
      { status: 501 }
    );
  }

  const limited = rateLimit(`upload:${user.id}`, RATE_LIMITS.post);
  if (!limited.success) {
    return NextResponse.json({ error: "Muitas tentativas. Aguarde um pouco." }, { status: 429 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const key = `uploads/${user.id}/${crypto.randomUUID()}-${sanitizeFilename(parsed.data.filename)}`;
  const { uploadUrl, publicUrl } = await createPresignedUpload(key, parsed.data.contentType);

  return NextResponse.json({ uploadUrl, publicUrl });
}
