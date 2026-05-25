/**
 * Rate limiter genérico — sliding window.
 *
 * Dos backends tras una misma interfaz:
 *   1. Upstash Redis REST (`UPSTASH_REDIS_REST_URL` + `_TOKEN`) — apto para
 *      Vercel multi-instancia / producción. Sliding window vía sorted set.
 *   2. Fallback `Map` en memoria — single-instance, suficiente para dev/demos.
 *
 * El caller no elige backend: `checkRateLimit` detecta las creds de Upstash y
 * usa Redis; si no, cae al Map. Así un mismo punto de llamada escala sin
 * cambios cuando se configuran las env vars.
 *
 * Refs: spec:015 (launch-readiness), reutiliza el patrón de spec:012.
 */

export type RateLimitResult = { ok: true } | { ok: false; retryInSec: number };

export type RateLimitConfig = {
  /** Máximo de eventos permitidos dentro de la ventana. */
  limit: number;
  /** Tamaño de la ventana en segundos. */
  windowSec: number;
};

type Bucket = number[]; // timestamps (ms)
const store: Map<string, Bucket> = new Map();

/** Solo para tests. */
export function __resetRateLimitStore(): void {
  store.clear();
}

export function checkRateLimitInMemory(key: string, cfg: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const windowMs = cfg.windowSec * 1000;
  const fresh = (store.get(key) ?? []).filter((t) => now - t < windowMs);

  if (fresh.length >= cfg.limit) {
    const oldest = fresh[0] ?? now;
    const retryInSec = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    store.set(key, fresh);
    return { ok: false, retryInSec };
  }

  fresh.push(now);
  store.set(key, fresh);
  return { ok: true };
}

function hasUpstash(): boolean {
  return (
    typeof process.env.UPSTASH_REDIS_REST_URL === 'string' &&
    process.env.UPSTASH_REDIS_REST_URL.length > 0 &&
    typeof process.env.UPSTASH_REDIS_REST_TOKEN === 'string' &&
    process.env.UPSTASH_REDIS_REST_TOKEN.length > 0
  );
}

/**
 * Sliding window sobre un sorted set de Redis vía la REST API de Upstash
 * (pipeline atómico). Cada evento es un member único (timestamp); se podan los
 * antiguos, se cuenta, y si hay hueco se inserta y se fija TTL.
 */
async function checkRateLimitUpstash(key: string, cfg: RateLimitConfig): Promise<RateLimitResult> {
  const base = process.env.UPSTASH_REDIS_REST_URL as string;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN as string;
  const now = Date.now();
  const windowMs = cfg.windowSec * 1000;
  const member = `${now}-${Math.random().toString(36).slice(2)}`;
  const redisKey = `rl:${key}`;

  const pipeline = [
    ['ZREMRANGEBYSCORE', redisKey, '0', String(now - windowMs)],
    ['ZADD', redisKey, String(now), member],
    ['ZCARD', redisKey],
    ['ZRANGE', redisKey, '0', '0', 'WITHSCORES'],
    ['EXPIRE', redisKey, String(cfg.windowSec)],
  ];

  const res = await fetch(`${base}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(pipeline),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`upstash ${res.status}`);
  const out = (await res.json()) as { result: unknown }[];
  const count = Number(out[2]?.result ?? 0);

  if (count > cfg.limit) {
    const range = out[3]?.result as string[] | undefined;
    const oldest = range && range.length >= 2 ? Number(range[1]) : now;
    const retryInSec = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    return { ok: false, retryInSec };
  }
  return { ok: true };
}

export async function checkRateLimit(key: string, cfg: RateLimitConfig): Promise<RateLimitResult> {
  if (hasUpstash()) {
    try {
      return await checkRateLimitUpstash(key, cfg);
    } catch {
      // Si Upstash falla, degradar al fallback en memoria en vez de bloquear.
      return checkRateLimitInMemory(key, cfg);
    }
  }
  return checkRateLimitInMemory(key, cfg);
}
