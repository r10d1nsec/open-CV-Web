/**
 * Tests for the in-memory contact rate-limit fallback.
 *
 * Refs: spec:012 §Non-functional (rate-limit), Sprint 6 S6.2.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CONTACT_LIMIT,
  CONTACT_WINDOW_SEC,
  __resetInMemoryStore,
  checkContactRateLimitInMemory,
} from '@/lib/rate-limit/contact';

beforeEach(() => {
  __resetInMemoryStore();
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-05-24T12:00:00Z'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('checkContactRateLimitInMemory', () => {
  it('allows the first CONTACT_LIMIT requests, blocks the next one', async () => {
    const ip = 'ip-1';
    for (let i = 0; i < CONTACT_LIMIT; i++) {
      const res = await checkContactRateLimitInMemory(ip);
      expect(res.ok).toBe(true);
    }
    const blocked = await checkContactRateLimitInMemory(ip);
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) expect(blocked.retryInSec).toBeGreaterThan(0);
  });

  it('isolates per-IP buckets', async () => {
    for (let i = 0; i < CONTACT_LIMIT; i++) await checkContactRateLimitInMemory('ip-a');
    const otherIp = await checkContactRateLimitInMemory('ip-b');
    expect(otherIp.ok).toBe(true);
  });

  it('resets after the window slides past CONTACT_WINDOW_SEC', async () => {
    const ip = 'ip-2';
    for (let i = 0; i < CONTACT_LIMIT; i++) await checkContactRateLimitInMemory(ip);
    expect((await checkContactRateLimitInMemory(ip)).ok).toBe(false);

    vi.advanceTimersByTime((CONTACT_WINDOW_SEC + 1) * 1000);
    const afterWindow = await checkContactRateLimitInMemory(ip);
    expect(afterWindow.ok).toBe(true);
  });
});
