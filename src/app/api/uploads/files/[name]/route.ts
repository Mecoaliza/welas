import { readLocalUpload } from "@/lib/local-storage";

export async function GET(_request: Request, ctx: RouteContext<"/api/uploads/files/[name]">) {
  const { name } = await ctx.params;
  const file = await readLocalUpload(name);
  if (!file) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(file.data), {
    headers: {
      "Content-Type": file.contentType,
      "X-Content-Type-Options": "nosniff",
      // Names are random UUIDs, so the content never changes.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
