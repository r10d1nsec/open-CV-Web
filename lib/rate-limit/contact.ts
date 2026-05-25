/**
 * Contact form rate limiter — Sprint 6 S6.2, refactor Sprint 9 (spec:015).
 *
 * Delega en el limiter genérico `core.ts` (sliding window con backend Upstash
 * o fallback en memoria). Mantiene su API pública estable para los callers y
 * tests existentes.
 *
 * Refs: spec:012, spec:015, ADR-0003.
 */
import {
  checkRateLimit,
  checkRateLimitInMemory,
  __resetRateLimitStore,
  type RateLimitResult,
} from './core';

export const CONTACT_LIMIT = 5;
export const CONTACT_WINDOW_SEC = 3600; // 1 hora

const CONFIG = { limit: CONTACT_LIMIT, windowSec: CONTACT_WINDOW_SEC };

export type { RateLimitResult };

export function __resetInMemoryStore(): void {
  __resetRateLimitStore();
}

export async function checkContactRateLimitInMemory(key: string): Promise<RateLimitResult> {
  return checkRateLimitInMemory(key, CONFIG);
}

export async function checkContactRateLimit(key: string): Promise<RateLimitResult> {
  return checkRateLimit(key, CONFIG);
}

/**
 * Construye una key para el rate limit. Combina IP hash + profile destino
 * para que un atacante no pueda agotar el bucket global con muchos targets.
 */
export function rateLimitKey(ipHash: string, profileId: string): string {
  return `contact:${ipHash}:${profileId}`;
}
