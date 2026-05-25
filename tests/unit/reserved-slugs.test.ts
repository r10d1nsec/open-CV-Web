/**
 * Tests for the reserved-slugs registry.
 *
 * Refs: spec:002 §Non-functional, spec:008 (routing migration), adr:0004 (url shape).
 */
import { describe, expect, it } from 'vitest';
import { RESERVED_SLUGS, isReservedSlug } from '@/lib/validation/reserved-slugs';

describe('RESERVED_SLUGS', () => {
  it('exposes a non-empty readonly set', () => {
    expect(RESERVED_SLUGS).toBeInstanceOf(Set);
    expect(RESERVED_SLUGS.size).toBeGreaterThan(20);
  });

  it.each([
    'api',
    'auth',
    'login',
    'signup',
    'logout',
    'forgot-password',
    'reset-password',
    'dashboard',
    'onboarding',
    'admin',
    'settings',
    'profile',
    'account',
    'legal',
    'c', // new card path after spec:008
    'u', // legacy portfolio path before spec:008
    'card', // legacy card path before spec:008
    '_next',
    'favicon',
    'sitemap',
    'robots',
  ])('contains critical slug %s', (slug) => {
    expect(RESERVED_SLUGS.has(slug)).toBe(true);
  });
});

describe('isReservedSlug', () => {
  it('returns true for any slug in the registry (case-insensitive)', () => {
    expect(isReservedSlug('dashboard')).toBe(true);
    expect(isReservedSlug('DASHBOARD')).toBe(true);
    expect(isReservedSlug('Dashboard')).toBe(true);
  });

  it('returns false for arbitrary user slugs', () => {
    expect(isReservedSlug('maya')).toBe(false);
    expect(isReservedSlug('maria-garcia')).toBe(false);
    expect(isReservedSlug('user42')).toBe(false);
  });

  it('returns true for empty / whitespace input (treat as reserved to refuse)', () => {
    expect(isReservedSlug('')).toBe(true);
    expect(isReservedSlug('   ')).toBe(true);
  });

  it('trims whitespace before checking', () => {
    expect(isReservedSlug('  dashboard  ')).toBe(true);
  });
});
