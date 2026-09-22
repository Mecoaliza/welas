import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Fixed-window rate limiter for sensitive actions (login, register, password
 * reset, posting). Uses Upstash Redis when UPSTASH_REDIS_REST_URL/TOKEN (or the
 * KV_REST_API_* names the Vercel integration sets) are present, so the limits
 * hold across serverless instances. Without Redis it falls back to an in-memory
 * store, which is only correct for a single Node process (local dev).
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Periodically drop expired buckets so this map doesn't grow forever.
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}, 5 * 60_000).unref?.();

export type RateLimitResult = {
  success: boolean;
  remaining: number;
  resetAt: number;
};

type Limit = { limit: number; windowMs: number };

const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

if (!redis && process.env.NODE_ENV === "production") {
  console.error(
    "[rate-limit] Upstash Redis não configurado — limites em memória não valem entre instâncias serverless."
  );
}

// One Ratelimit instance per (limit, window) pair; the caller's key is already namespaced.
const limiters = new Map<string, Ratelimit>();

function getLimiter({ limit, windowMs }: Limit) {
  const id = `${limit}:${windowMs}`;
  let limiter = limiters.get(id);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.fixedWindow(limit, `${windowMs} ms`),
      prefix: `conectax:rl:${id}`,
    });
    limiters.set(id, limiter);
  }
  return limiter;
}

function memoryRateLimit(key: string, { limit, windowMs }: Limit): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (bucket.count >= limit) {
    return { success: false, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  return { success: true, remaining: limit - bucket.count, resetAt: bucket.resetAt };
}

export async function rateLimit(key: string, config: Limit): Promise<RateLimitResult> {
  if (!redis) return memoryRateLimit(key, config);

  try {
    const { success, remaining, reset } = await getLimiter(config).limit(key);
    return { success, remaining, resetAt: reset };
  } catch (error) {
    // Redis outage: degrade to the per-instance limit instead of failing open entirely.
    console.error("[rate-limit] Upstash indisponível, usando limite em memória.", error);
    return memoryRateLimit(key, config);
  }
}

export const RATE_LIMITS = {
  login: { limit: 10, windowMs: 15 * 60_000 },
  loginIp: { limit: 50, windowMs: 15 * 60_000 },
  register: { limit: 5, windowMs: 60 * 60_000 },
  passwordReset: { limit: 5, windowMs: 60 * 60_000 },
  comment: { limit: 20, windowMs: 60_000 },
  post: { limit: 10, windowMs: 60_000 },
} as const;

/**
 * Best-effort client IP. On Vercel, `x-vercel-forwarded-for` / `x-real-ip` are set by
 * the platform itself and can't be spoofed by the client. Elsewhere, only trust
 * `x-forwarded-for` when a reverse proxy we control sets it (TRUST_PROXY=true) — then
 * the last hop is the one the proxy appended. Without a proxy the header is
 * client-controlled, so IP-based limits are advisory and per-account limits must
 * carry the real protection.
 */
export function getClientIp(headers: Headers) {
  if (process.env.VERCEL) {
    const vercelIp = headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip");
    if (vercelIp) return vercelIp;
  }

  const hops = headers.get("x-forwarded-for")?.split(",").map((h) => h.trim()).filter(Boolean) ?? [];
  if (hops.length === 0) return "unknown";
  return process.env.TRUST_PROXY === "true" ? hops[hops.length - 1] : hops[0];
}
