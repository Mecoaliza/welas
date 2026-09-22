const YOUTUBE_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "youtube-nocookie.com", "www.youtube-nocookie.com"]);
const VIMEO_HOSTS = new Set(["vimeo.com", "www.vimeo.com", "player.vimeo.com"]);
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const VIMEO_ID = /^\d+$/;

/**
 * Turns a common share URL (YouTube/Vimeo) into its embeddable iframe URL.
 * Hosts are matched exactly and the embed URL is always rebuilt from a validated
 * ID — the input URL is never passed through, so it can't point the iframe elsewhere.
 */
export function toEmbedUrl(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;

  const host = parsed.hostname.toLowerCase();
  const segments = parsed.pathname.split("/").filter(Boolean);

  if (YOUTUBE_HOSTS.has(host)) {
    const id =
      parsed.searchParams.get("v") ??
      (["embed", "shorts", "live"].includes(segments[0]) ? segments[1] : undefined);
    return id && YOUTUBE_ID.test(id) ? `https://www.youtube.com/embed/${id}` : null;
  }

  if (host === "youtu.be") {
    const id = segments[0];
    return id && YOUTUBE_ID.test(id) ? `https://www.youtube.com/embed/${id}` : null;
  }

  if (VIMEO_HOSTS.has(host)) {
    const id = segments.findLast((s) => VIMEO_ID.test(s));
    return id ? `https://player.vimeo.com/video/${id}` : null;
  }

  return null;
}
