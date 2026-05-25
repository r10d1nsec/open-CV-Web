/**
 * Tests de la Server Action de borrado de cuenta (Sprint 9 · spec:015).
 *
 * Mock de `@/lib/supabase/server` (createClient + createAdminClient) y de
 * `next/navigation` (redirect lanza sentinel). Verifica las fricciones:
 * sesión, match de username, re-auth por password, y borrado vía admin.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({
  user: { id: 'u-1', email: 'maya@studio.dev' } as { id: string; email: string } | null,
  profile: { username: 'maya' } as { username: string } | null,
  passwordOk: true,
  deleteOk: true,
  deletedId: null as string | null,
  signedOut: false,
}));

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: vi.fn(async () => ({ data: { user: state.user } })),
      signInWithPassword: vi.fn(async () => ({ error: state.passwordOk ? null : { message: 'bad' } })),
      signOut: vi.fn(async () => {
        state.signedOut = true;
        return { error: null };
      }),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(async () => ({ data: state.profile, error: null })),
        })),
      })),
    })),
  })),
  createAdminClient: vi.fn(async () => ({
    auth: {
      admin: {
        deleteUser: vi.fn(async (id: string) => {
          if (!state.deleteOk) return { error: { message: 'fail' } };
          state.deletedId = id;
          return { error: null };
        }),
      },
    },
  })),
  redirect: vi.fn((path: string) => {
    const err = new Error('NEXT_REDIRECT') as Error & { digest: string };
    err.digest = `NEXT_REDIRECT;${path}`;
    throw err;
  }),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: mocks.createClient,
  createAdminClient: mocks.createAdminClient,
}));
vi.mock('next/navigation', () => ({ redirect: mocks.redirect }));

import { deleteAccount } from '@/app/(dashboard)/dashboard/settings/_actions/delete-account';

function fd(entries: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(entries)) f.append(k, v);
  return f;
}

beforeEach(() => {
  state.user = { id: 'u-1', email: 'maya@studio.dev' };
  state.profile = { username: 'maya' };
  state.passwordOk = true;
  state.deleteOk = true;
  state.deletedId = null;
  state.signedOut = false;
});

afterEach(() => vi.clearAllMocks());

describe('deleteAccount', () => {
  it('rejects when not authenticated', async () => {
    state.user = null;
    const res = await deleteAccount(null, fd({ confirmUsername: 'maya', password: 'x' }));
    expect(res.ok).toBe(false);
  });

  it('rejects when username does not match', async () => {
    const res = await deleteAccount(null, fd({ confirmUsername: 'nope', password: 'x' }));
    expect(res.ok).toBe(false);
    expect(state.deletedId).toBeNull();
  });

  it('rejects on wrong password', async () => {
    state.passwordOk = false;
    const res = await deleteAccount(null, fd({ confirmUsername: 'maya', password: 'wrong' }));
    expect(res.ok).toBe(false);
    expect(state.deletedId).toBeNull();
  });

  it('surfaces an error if admin delete fails', async () => {
    state.deleteOk = false;
    const res = await deleteAccount(null, fd({ confirmUsername: 'maya', password: 'ok' }));
    expect(res.ok).toBe(false);
  });

  it('deletes via admin, signs out and redirects on success', async () => {
    await expect(
      deleteAccount(null, fd({ confirmUsername: 'MAYA', password: 'ok' })),
    ).rejects.toThrow('NEXT_REDIRECT');
    expect(state.deletedId).toBe('u-1');
    expect(state.signedOut).toBe(true);
    expect(mocks.redirect).toHaveBeenCalledWith('/?deleted=1');
  });
});
