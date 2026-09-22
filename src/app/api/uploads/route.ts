import { NextResponse } from "next/server";
import crypto from "crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";

import { getSessionUser } from "@/lib/session";
import { ALLOWED_UPLOAD_TYPES, UPLOAD_MAX_SIZE_BYTES, getS3Client, getPublicUrl, isS3Configured } from "@/lib/s3";
import { saveLocalUpload, sniffImageType } from "@/lib/local-storage";
import { RATE_LIMITS, rateLimit } from "@/lib/rate-limit";

/** Admin image upload (multipart). Goes to S3 when configured, local disk otherwise. */
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const limited = rateLimit(`upload:${user.id}`, RATE_LIMITS.post);
  if (!limited.success) {
    return NextResponse.json({ error: "Muitas tentativas. Aguarde um pouco." }, { status: 429 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
  }
  if (file.size > UPLOAD_MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "A imagem deve ter no máximo 5MB." }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const contentType = sniffImageType(bytes);
  if (!contentType || !ALLOWED_UPLOAD_TYPES.includes(contentType)) {
    return NextResponse.json({ error: "Formato inválido. Use JPG, PNG, WEBP ou GIF." }, { status: 400 });
  }

  if (!isS3Configured()) {
    return NextResponse.json({ url: await saveLocalUpload(bytes, contentType) });
  }

  const key = `uploads/${user.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_").slice(-100)}`;
  await getS3Client().send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: key,
      ContentType: contentType,
      Body: bytes,
    })
  );
  return NextResponse.json({ url: getPublicUrl(key) });
}
