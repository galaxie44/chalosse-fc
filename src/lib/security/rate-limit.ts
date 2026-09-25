type Bucket = { count: number; resetAt: number };

const store = globalThis as typeof globalThis & {
  __chalosseRateLimit?: Map<string, Bucket>;
};

function buckets() {
  if (!store.__chalosseRateLimit) {
    store.__chalosseRateLimit = new Map();
  }
  return store.__chalosseRateLimit;
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();
  const map = buckets();
  const current = map.get(key);
  if (!current || current.resetAt < now) {
    map.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }
  if (current.count >= limit) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }
  current.count += 1;
  return { ok: true, retryAfterSec: 0 };
}

export function clientKey(prefix: string, ip: string | null) {
  return `${prefix}:${ip || "unknown"}`;
}
