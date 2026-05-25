// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  assertProductionEnv,
  hasSupabaseEnv,
  requireServiceRoleKey,
  requireSupabaseEnv,
} from '@/lib/env';

const SUPABASE_KEYS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
] as const;

const VALID_URL = 'https://abcdefghijklmnop.supabase.co';
const VALID_KEY = 'a'.repeat(40);

describe('lib/env', () => {
  let saved: Record<string, string | undefined>;

  beforeEach(() => {
    saved = Object.fromEntries(SUPABASE_KEYS.map((k) => [k, process.env[k]])) as Record<
      string,
      string | undefined
    >;
    for (const k of SUPABASE_KEYS) delete process.env[k];
  });

  afterEach(() => {
    for (const [k, v] of Object.entries(saved)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  });

  describe('hasSupabaseEnv()', () => {
    it('returns false when vars are missing', () => {
      expect(hasSupabaseEnv()).toBe(false);
    });

    it('returns false when URL is invalid', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'not-a-url';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = VALID_KEY;
      expect(hasSupabaseEnv()).toBe(false);
    });

    it('returns true with valid vars', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = VALID_URL;
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = VALID_KEY;
      expect(hasSupabaseEnv()).toBe(true);
    });
  });

  describe('requireSupabaseEnv()', () => {
    it('throws a developer-friendly error when vars are missing', () => {
      expect(() => requireSupabaseEnv()).toThrowError(/Supabase env vars missing/);
    });

    it('throws when the anon key is too short', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = VALID_URL;
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'short';
      expect(() => requireSupabaseEnv()).toThrowError(/too short/);
    });

    it('returns parsed vars when valid', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = VALID_URL;
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = VALID_KEY;
      expect(requireSupabaseEnv()).toEqual({
        NEXT_PUBLIC_SUPABASE_URL: VALID_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: VALID_KEY,
      });
    });
  });

  describe('requireServiceRoleKey()', () => {
    it('throws when the service role key is missing', () => {
      expect(() => requireServiceRoleKey()).toThrowError(/SUPABASE_SERVICE_ROLE_KEY/);
    });

    it('returns the key when present', () => {
      process.env.SUPABASE_SERVICE_ROLE_KEY = VALID_KEY;
      expect(requireServiceRoleKey()).toBe(VALID_KEY);
    });
  });

  describe('assertProductionEnv()', () => {
    let originalNodeEnv: string | undefined;

    beforeEach(() => {
      originalNodeEnv = process.env.NODE_ENV;
    });

    afterEach(() => {
      const env = process.env as Record<string, string | undefined>;
      if (originalNodeEnv === undefined) delete env.NODE_ENV;
      else env.NODE_ENV = originalNodeEnv;
    });

    it('is a no-op outside production', () => {
      (process.env as Record<string, string>).NODE_ENV = 'test';
      expect(() => assertProductionEnv()).not.toThrow();
    });

    it('throws in production when vars are missing', () => {
      (process.env as Record<string, string>).NODE_ENV = 'production';
      expect(() => assertProductionEnv()).toThrowError(/Supabase env vars missing/);
    });

    it('does not throw in production when vars are valid', () => {
      (process.env as Record<string, string>).NODE_ENV = 'production';
      process.env.NEXT_PUBLIC_SUPABASE_URL = VALID_URL;
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = VALID_KEY;
      expect(() => assertProductionEnv()).not.toThrow();
    });
  });
});
