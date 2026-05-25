/**
 * lib/auth.ts — getCurrentUser + requireUser, mocked supabase + redirect.
 *
 * Refs: spec:001 T9, adr:0002
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const supabaseMocks = vi.hoisted(() => {
  const auth = { getUser: vi.fn() };
  return { auth, createClient: vi.fn(async () => ({ auth })) };
});

const navMocks = vi.hoisted(() => ({
  redirect: vi.fn((path: string) => {
    const err = new Error('NEXT_REDIRECT') as Error & { digest: string };
    err.digest = `NEXT_REDIRECT;${path}`;
    throw err;
  }),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: supabaseMocks.createClient,
}));
vi.mock('next/navigation', () => ({
  redirect: navMocks.redirect,
}));

import { getCurrentUser, requireUser } from '@/lib/auth';

const fakeUser = { id: 'u_1', email: 'a@b.com' } as never;

beforeEach(() => {
  supabaseMocks.auth.getUser.mockReset();
  navMocks.redirect.mockClear();
});

describe('getCurrentUser()', () => {
  it('returns the user when supabase reports one', async () => {
    supabaseMocks.auth.getUser.mockResolvedValueOnce({ data: { user: fakeUser }, error: null });
    await expect(getCurrentUser()).resolves.toEqual(fakeUser);
  });

  it('returns null when supabase returns no user', async () => {
    supabaseMocks.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });
    await expect(getCurrentUser()).resolves.toBeNull();
  });

  it('returns null when supabase errors (does NOT throw)', async () => {
    supabaseMocks.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'session expired', status: 401 },
    });
    await expect(getCurrentUser()).resolves.toBeNull();
  });
});

describe('requireUser()', () => {
  it('returns the user when authenticated', async () => {
    supabaseMocks.auth.getUser.mockResolvedValueOnce({ data: { user: fakeUser }, error: null });
    await expect(requireUser()).resolves.toEqual(fakeUser);
    expect(navMocks.redirect).not.toHaveBeenCalled();
  });

  it('redirects to /login when there is no session', async () => {
    supabaseMocks.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });
    await expect(requireUser()).rejects.toThrow('NEXT_REDIRECT');
    expect(navMocks.redirect).toHaveBeenCalledWith('/login');
  });

  it('encodes the next param when provided', async () => {
    supabaseMocks.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });
    await expect(requireUser('/dashboard?tab=portfolio')).rejects.toThrow('NEXT_REDIRECT');
    expect(navMocks.redirect).toHaveBeenCalledWith(
      '/login?next=%2Fdashboard%3Ftab%3Dportfolio',
    );
  });

  it('drops next when it is not a same-origin path (open-redirect guard)', async () => {
    supabaseMocks.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });
    await expect(requireUser('https://evil.com/x')).rejects.toThrow('NEXT_REDIRECT');
    expect(navMocks.redirect).toHaveBeenCalledWith('/login');
  });

  it('drops next when it is protocol-relative', async () => {
    supabaseMocks.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });
    await expect(requireUser('//evil.com/x')).rejects.toThrow('NEXT_REDIRECT');
    expect(navMocks.redirect).toHaveBeenCalledWith('/login');
  });
});
