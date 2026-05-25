/**
 * Tests del limiter genérico (in-memory) y del de signup.
 *
 * Solo se ejercita el fallback in-memory (sin creds de Upstash en test).
 *
 * Refs: spec:015 (launch-readiness).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  checkRateLimitInMemory,
  __resetRateLimitStore,
} from '@/lib/rate-limit/core';
import {
  checkSignupRateLimit,
  signupRateLimitKey,
  SIGNUP_LIMIT,
} from '@/lib/rate-limit/signup';

beforeEach(() => {
  __resetRateLimitStore();
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-05-25T12:00:00Z'));
});

afterEach(() => vi.useRealTimers());

describe('checkRateLimitInMemory', () => {
  const cfg = { limit: 3, windowSec: 60 };

  it('allows up to limit, then blocks with retryInSec', () => {
    for (let i = 0; i < cfg.limit; i++) {
      expect(checkRateLimitInMemory('k', cfg).ok).toBe(true);
    }
    const blocked = checkRateLimitInMemory('k', cfg);
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) expect(blocked.retryInSec).toBeGreaterThan(0);
  });

  it('isolates buckets by key', () => {
    for (let i = 0; i < cfg.limit; i++) checkRateLimitInMemory('a', cfg);
    expect(checkRateLimitInMemory('a', cfg).ok).toBe(false);
    expect(checkRateLimitInMemory('b', cfg).ok).toBe(true);
  });

  it('allows again after the window slides', () => {
    for (let i = 0; i < cfg.limit; i++) checkRateLimitInMemory('k', cfg);
    expect(checkRateLimitInMemory('k', cfg).ok).toBe(false);
    vi.advanceTimersByTime(61_000);
    expect(checkRateLimitInMemory('k', cfg).ok).toBe(true);
  });
});

describe('signup rate limit', () => {
  it('builds a namespaced key', () => {
    expect(signupRateLimitKey('abc123')).toBe('signup:abc123');
  });

  it('blocks after SIGNUP_LIMIT attempts from the same ip hash', async () => {
    for (let i = 0; i < SIGNUP_LIMIT; i++) {
      expect((await checkSignupRateLimit('ip-1')).ok).toBe(true);
    }
    expect((await checkSignupRateLimit('ip-1')).ok).toBe(false);
    expect((await checkSignupRateLimit('ip-2')).ok).toBe(true);
  });
});
