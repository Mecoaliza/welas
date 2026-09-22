import crypto from "crypto";
import path from "path";
import { mkdir, readFile, writeFile } from "fs/promises";

/**
 * Disk fallback for uploads when S3 is not configured (local dev / single server).
 * Files live outside `public/` because Next only serves public files present at build time.
 */
export const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "storage", "uploads");

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const CONTENT_TYPES = Object.fromEntries(
  Object.entries(EXTENSIONS).map(([type, ext]) => [ext, type])
);
CONTENT_TYPES.jpeg = "image/jpeg";

/**
 * Detects the image type from the file's first bytes. The browser-supplied
 * `file.type` is just a label the client picks, so it can't be trusted.
 */
export function sniffImageType(bytes: Buffer): string | null {
  const ascii = (start: number, end: number) => bytes.subarray(start, end).toString("latin1");
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (ascii(0, 6) === "GIF87a" || ascii(0, 6) === "GIF89a") return "image/gif";
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "image/webp";
  return null;
}

export async function saveLocalUpload(bytes: Buffer, contentType: string) {
  const name = `${crypto.randomUUID()}.${EXTENSIONS[contentType]}`;
  await mkdir(LOCAL_UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(LOCAL_UPLOAD_DIR, name), bytes);
  return `/api/uploads/files/${name}`;
}

export async function readLocalUpload(name: string) {
  // Only accept the names we generate — blocks path traversal.
  if (!/^[a-f0-9-]{36}\.(jpg|jpeg|png|webp|gif)$/.test(name)) return null;
  try {
    const data = await readFile(path.join(LOCAL_UPLOAD_DIR, name));
    return { data, contentType: CONTENT_TYPES[name.split(".").pop()!] };
  } catch {
    return null;
  }
}
