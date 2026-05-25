/**
 * Unit tests for the profile-store dispatcher.
 * Verifies the env-gated fallback to the mock driver.
 *
 * Refs: spec:002 §Implementation (Sub-sprint 3c), tarea T10.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock env BEFORE importing the module under test.
vi.mock('@/lib/env', () => ({
  hasSupabaseEnv: vi.fn(),
}));

// Mock supabase-driver so the dispatcher path is testable without touching the network
// (and so we don't import next/headers in a unit test).
vi.mock('@/lib/profile-store/supabase-driver', () => ({
  getProfileFromSupabase: vi.fn(),
  getProfileFromSupabaseByUserId: vi.fn(),
}));

// Mock auth helper for getCurrentProfile composition.
vi.mock('@/lib/auth', () => ({
  getCurrentUser: vi.fn(),
}));

import { hasSupabaseEnv } from '@/lib/env';
import {
  getProfileFromSupabase,
  getProfileFromSupabaseByUserId,
} from '@/lib/profile-store/supabase-driver';
import { getCurrentUser } from '@/lib/auth';
import {
  getCurrentProfile,
  getProfileByUserId,
  getProfileByUsername,
} from '@/lib/profile-store';
import { mockMaya } from '@/data/mock-maya';

const hasSupabaseEnvMock = vi.mocked(hasSupabaseEnv);
const getProfileFromSupabaseMock = vi.mocked(getProfileFromSupabase);
const getProfileFromSupabaseByUserIdMock = vi.mocked(getProfileFromSupabaseByUserId);
const getCurrentUserMock = vi.mocked(getCurrentUser);

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.resetAllMocks();
});

describe('getProfileByUsername (dispatcher)', () => {
  describe('when Supabase env is NOT configured', () => {
    beforeEach(() => {
      hasSupabaseEnvMock.mockReturnValue(false);
    });

    it('returns mockMaya for username "maya"', async () => {
      await expect(getProfileByUsername('maya')).resolves.toEqual(mockMaya);
      expect(getProfileFromSupabaseMock).not.toHaveBeenCalled();
    });

    it('returns null for any other username', async () => {
      await expect(getProfileByUsername('unknown')).resolves.toBeNull();
      await expect(getProfileByUsername('')).resolves.toBeNull();
      expect(getProfileFromSupabaseMock).not.toHaveBeenCalled();
    });
  });

  describe('when Supabase env IS configured', () => {
    beforeEach(() => {
      hasSupabaseEnvMock.mockReturnValue(true);
    });

    it('delegates to the supabase driver and returns its result', async () => {
      getProfileFromSupabaseMock.mockResolvedValue(mockMaya);
      await expect(getProfileByUsername('maya')).resolves.toEqual(mockMaya);
      expect(getProfileFromSupabaseMock).toHaveBeenCalledWith('maya');
    });

    it('returns null when the driver finds no row', async () => {
      getProfileFromSupabaseMock.mockResolvedValue(null);
      await expect(getProfileByUsername('ghost')).resolves.toBeNull();
      expect(getProfileFromSupabaseMock).toHaveBeenCalledWith('ghost');
    });

    it('propagates driver errors (no swallow)', async () => {
      const boom = new Error('supabase down');
      getProfileFromSupabaseMock.mockRejectedValue(boom);
      await expect(getProfileByUsername('maya')).rejects.toThrow('supabase down');
    });
  });
});

describe('getProfileByUserId (dispatcher)', () => {
  describe('when Supabase env is NOT configured', () => {
    beforeEach(() => {
      hasSupabaseEnvMock.mockReturnValue(false);
    });

    it('returns mockMaya when the userId matches the mock sentinel', async () => {
      await expect(getProfileByUserId('mock-maya-user-id')).resolves.toEqual(mockMaya);
      expect(getProfileFromSupabaseByUserIdMock).not.toHaveBeenCalled();
    });

    it('returns null for any other userId', async () => {
      await expect(getProfileByUserId('whatever')).resolves.toBeNull();
      await expect(getProfileByUserId('')).resolves.toBeNull();
    });
  });

  describe('when Supabase env IS configured', () => {
    beforeEach(() => {
      hasSupabaseEnvMock.mockReturnValue(true);
    });

    it('delegates to the driver and returns its result', async () => {
      getProfileFromSupabaseByUserIdMock.mockResolvedValue(mockMaya);
      await expect(getProfileByUserId('u-1')).resolves.toEqual(mockMaya);
      expect(getProfileFromSupabaseByUserIdMock).toHaveBeenCalledWith('u-1');
    });

    it('returns null when the driver finds no row', async () => {
      getProfileFromSupabaseByUserIdMock.mockResolvedValue(null);
      await expect(getProfileByUserId('ghost')).resolves.toBeNull();
    });
  });
});

describe('getCurrentProfile (dispatcher)', () => {
  beforeEach(() => {
    hasSupabaseEnvMock.mockReturnValue(true);
  });

  it('returns null when there is no authenticated user', async () => {
    getCurrentUserMock.mockResolvedValue(null);
    await expect(getCurrentProfile()).resolves.toBeNull();
    expect(getProfileFromSupabaseByUserIdMock).not.toHaveBeenCalled();
  });

  it('delegates to getProfileByUserId with the auth user.id', async () => {
    getCurrentUserMock.mockResolvedValue({ id: 'user-42' } as never);
    getProfileFromSupabaseByUserIdMock.mockResolvedValue(mockMaya);
    await expect(getCurrentProfile()).resolves.toEqual(mockMaya);
    expect(getProfileFromSupabaseByUserIdMock).toHaveBeenCalledWith('user-42');
  });

  it('returns null when the user has no profile yet (pre-onboarding)', async () => {
    getCurrentUserMock.mockResolvedValue({ id: 'user-new' } as never);
    getProfileFromSupabaseByUserIdMock.mockResolvedValue(null);
    await expect(getCurrentProfile()).resolves.toBeNull();
  });
});
