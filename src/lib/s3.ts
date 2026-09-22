import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// 4MB: Vercel functions reject request bodies above 4.5MB.
export const UPLOAD_MAX_SIZE_BYTES = 4 * 1024 * 1024;
export const ALLOWED_UPLOAD_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function isS3Configured() {
  return Boolean(
    process.env.S3_BUCKET && process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY
  );
}

export function getS3Client() {
  return new S3Client({
    region: process.env.S3_REGION || "auto",
    endpoint: process.env.S3_ENDPOINT || undefined,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: Boolean(process.env.S3_ENDPOINT),
  });
}

/** Presigned PUT URL for a direct browser upload — the file never touches our server. */
export async function createPresignedUpload(key: string, contentType: string) {
  const client = getS3Client();
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET!,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 60 });
  return { uploadUrl, publicUrl: getPublicUrl(key) };
}

export function getPublicUrl(key: string) {
  return process.env.S3_PUBLIC_URL
    ? `${process.env.S3_PUBLIC_URL.replace(/\/$/, "")}/${key}`
    : `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${key}`;
}
