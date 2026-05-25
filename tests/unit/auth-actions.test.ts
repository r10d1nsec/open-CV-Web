/**
 * Server Actions of auth flow — unit tests with mocked Supabase client.
 *
 * Strategy:
 *   - Mock `@/lib/supabase/server` so actions get a controllable fake client.
 *   - Mock `next/navigation` — redirect() throws a sentinel that tests catch.
 *   - Mock `next/cache` — revalidatePath() is a no-op spy.
 *   - Mock `next/headers` — headers() returns a Headers we control for origin.
 *
 * Refs: spec:001 §Test plan, AC2 (cookies/session), AC3 (logout),
 *       AC4 (reset), AC6 (a11y errors — covered in page tests later).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Hoisted mocks: declared with vi.hoisted so they can be referenced both in
// the mock factory and in test bodies. This is the documented vitest pattern.
const supabaseMocks = vi.hoisted(() => {
  const auth = {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    updateUser: vi.fn(),
  };
  return {
    auth,
    createClient: vi.fn(async () => ({ auth })),
  };
});

const navMocks = vi.hoisted(() => ({
  redirect: vi.fn((path: string) => {
    const err = new Error('NEXT_REDIRECT') as Error & { digest: string };
    err.digest = `NEXT_REDIRECT;${path}`;
    throw err;
  }),
}));

const cacheMocks = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
}));

const headersMocks = vi.hoisted(() => ({
  headers: vi.fn(async () => new Headers({ origin: 'http://localhost:3000' })),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: supabaseMocks.createClient,
}));

vi.mock('next/navigation', () => ({
  redirect: navMocks.redirect,
}));

vi.mock('next/cache', () => ({
  revalidatePath: cacheMocks.revalidatePath,
}));

vi.mock('next/headers', () => ({
  headers: headersMocks.headers,
}));

import { login } from '@/app/(auth)/_actions/login';
import { signup } from '@/app/(auth)/_actions/signup';
import { logout } from '@/app/(auth)/_actions/logout';
import { forgotPassword } from '@/app/(auth)/_actions/forgot-password';
import { resetPassword } from '@/app/(auth)/_actions/reset-password';

beforeEach(() => {
  Object.values(supabaseMocks.auth).forEach((m) => m.mockReset());
  navMocks.redirect.mockClear();
  cacheMocks.revalidatePath.mockClear();
  headersMocks.headers.mockClear();
  // Restore default headers mock implementation after .mockClear
  headersMocks.headers.mockImplementation(async () => new Headers({ origin: 'http://localhost:3000' }));
});

afterEach(() => {
  vi.clearAllMocks();
});

function fd(entries: Record<string, string>): FormData {
  const data = new FormData();
  for (const [k, v] of Object.entries(entries)) data.append(k, v);
  return data;
}

// ----------------------------------------------------------------------------
// login
// ----------------------------------------------------------------------------
describe('login()', () => {
  it('rejects invalid email with a field-specific error and does NOT call Supabase', async () => {
    const result = await login(fd({ email: 'not-an-email', password: 'x' }));
    expect(result).toEqual({ ok: false, error: expect.stringMatching(/email/i), field: 'email' });
    expect(supabaseMocks.auth.signInWithPassword).not.toHaveBeenCalled();
  });

  it('returns a generic error on invalid credentials (no user enumeration)', async () => {
    supabaseMocks.auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials', status: 400 },
    });

    const result = await login(fd({ email: 'user@example.com', password: 'wrong-password' }));

    expect(result).toEqual({
      ok: false,
      error: 'Email o contraseña incorrectos',
      field: 'form',
    });
    expect(supabaseMocks.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'wrong-password',
    });
  });

  it('normalizes email (trim + lowercase) before calling Supabase', async () => {
    supabaseMocks.auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: { id: 'u1' }, session: { access_token: 't' } },
      error: null,
    });

    await expect(login(fd({ email: '  User@Example.COM  ', password: 'pw12345!' }))).rejects.toThrow(
      'NEXT_REDIRECT',
    );

    expect(supabaseMocks.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'pw12345!',
    });
  });

  it('on success: revalidates root and redirects to /dashboard', async () => {
    supabaseMocks.auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: { id: 'u1' }, session: { access_token: 't' } },
      error: null,
    });

    await expect(login(fd({ email: 'a@b.com', password: 'pw12345!' }))).rejects.toThrow('NEXT_REDIRECT');

    expect(cacheMocks.revalidatePath).toHaveBeenCalledWith('/', 'layout');
    expect(navMocks.redirect).toHaveBeenCalledWith('/dashboard');
  });

  it('honors a safe `next` param on login', async () => {
    supabaseMocks.auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: { id: 'u1' }, session: { access_token: 't' } },
      error: null,
    });
    await expect(
      login(fd({ email: 'a@b.com', password: 'pw12345!', next: '/dashboard/edit' })),
    ).rejects.toThrow('NEXT_REDIRECT');
    expect(navMocks.redirect).toHaveBeenCalledWith('/dashboard/edit');
  });

  it('ignores an unsafe `next` (open redirect)', async () => {
    supabaseMocks.auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: { id: 'u1' }, session: { access_token: 't' } },
      error: null,
    });
    await expect(
      login(fd({ email: 'a@b.com', password: 'pw12345!', next: '//evil.com' })),
    ).rejects.toThrow('NEXT_REDIRECT');
    expect(navMocks.redirect).toHaveBeenCalledWith('/dashboard');
  });
});

// ----------------------------------------------------------------------------
// signup
// ----------------------------------------------------------------------------
describe('signup()', () => {
  it('rejects mismatched passwords with field=confirmPassword', async () => {
    const result = await signup(
      fd({ email: 'a@b.com', password: 'pw12345!', confirmPassword: 'different' }),
    );
    expect(result).toEqual({
      ok: false,
      error: 'Las contraseñas no coinciden',
      field: 'confirmPassword',
    });
    expect(supabaseMocks.auth.signUp).not.toHaveBeenCalled();
  });

  it('rejects weak passwords (< 8 chars) with field=password', async () => {
    const result = await signup(
      fd({ email: 'a@b.com', password: 'short', confirmPassword: 'short' }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.field).toBe('password');
      expect(result.error).toMatch(/8 caracteres/i);
    }
  });

  it('passes emailRedirectTo built from origin header', async () => {
    supabaseMocks.auth.signUp.mockResolvedValueOnce({
      data: { user: { id: 'u1' }, session: null },
      error: null,
    });

    await expect(
      signup(fd({ email: 'a@b.com', password: 'pw12345!', confirmPassword: 'pw12345!' })),
    ).rejects.toThrow('NEXT_REDIRECT');

    expect(supabaseMocks.auth.signUp).toHaveBeenCalledWith({
      email: 'a@b.com',
      password: 'pw12345!',
      options: { emailRedirectTo: 'http://localhost:3000/auth/callback' },
    });
  });

  it('redirects to /signup/check-email when session is null (confirmation pending)', async () => {
    supabaseMocks.auth.signUp.mockResolvedValueOnce({
      data: { user: { id: 'u1' }, session: null },
      error: null,
    });

    await expect(
      signup(fd({ email: 'a@b.com', password: 'pw12345!', confirmPassword: 'pw12345!' })),
    ).rejects.toThrow('NEXT_REDIRECT');

    expect(navMocks.redirect).toHaveBeenCalledWith('/signup/check-email?email=a%40b.com');
  });

  it('redirects to /dashboard + revalidates when session is returned immediately (email confirmation OFF)', async () => {
    supabaseMocks.auth.signUp.mockResolvedValueOnce({
      data: { user: { id: 'u1' }, session: { access_token: 't' } },
      error: null,
    });

    await expect(
      signup(fd({ email: 'a@b.com', password: 'pw12345!', confirmPassword: 'pw12345!' })),
    ).rejects.toThrow('NEXT_REDIRECT');

    expect(cacheMocks.revalidatePath).toHaveBeenCalledWith('/', 'layout');
    expect(navMocks.redirect).toHaveBeenCalledWith('/dashboard');
  });

  it('surfaces Supabase "already registered" error with field=email', async () => {
    supabaseMocks.auth.signUp.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: 'User already registered', status: 400 },
    });

    const result = await signup(
      fd({ email: 'a@b.com', password: 'pw12345!', confirmPassword: 'pw12345!' }),
    );

    expect(result).toEqual({
      ok: false,
      error: expect.stringMatching(/ya está registrado/i),
      field: 'email',
    });
  });
});

// ----------------------------------------------------------------------------
// logout
// ----------------------------------------------------------------------------
describe('logout()', () => {
  it('calls signOut, revalidates root and redirects to /', async () => {
    supabaseMocks.auth.signOut.mockResolvedValueOnce({ error: null });

    await expect(logout()).rejects.toThrow('NEXT_REDIRECT');

    expect(supabaseMocks.auth.signOut).toHaveBeenCalledTimes(1);
    expect(cacheMocks.revalidatePath).toHaveBeenCalledWith('/', 'layout');
    expect(navMocks.redirect).toHaveBeenCalledWith('/');
  });
});

// ----------------------------------------------------------------------------
// forgot-password
// ----------------------------------------------------------------------------
describe('forgotPassword()', () => {
  it('rejects invalid email with field=email', async () => {
    const result = await forgotPassword(fd({ email: 'no-arroba' }));
    expect(result).toEqual({ ok: false, error: expect.any(String), field: 'email' });
    expect(supabaseMocks.auth.resetPasswordForEmail).not.toHaveBeenCalled();
  });

  it('always returns { ok: true } even when email is unknown (no enumeration)', async () => {
    supabaseMocks.auth.resetPasswordForEmail.mockResolvedValueOnce({
      data: {},
      error: { message: 'User not found', status: 404 },
    });

    const result = await forgotPassword(fd({ email: 'unknown@example.com' }));

    expect(result).toEqual({ ok: true });
    expect(supabaseMocks.auth.resetPasswordForEmail).toHaveBeenCalledWith('unknown@example.com', {
      redirectTo: 'http://localhost:3000/reset-password',
    });
  });

  it('returns { ok: true } on success', async () => {
    supabaseMocks.auth.resetPasswordForEmail.mockResolvedValueOnce({ data: {}, error: null });

    const result = await forgotPassword(fd({ email: 'user@example.com' }));

    expect(result).toEqual({ ok: true });
  });
});

// ----------------------------------------------------------------------------
// reset-password
// ----------------------------------------------------------------------------
describe('resetPassword()', () => {
  it('rejects weak password', async () => {
    const result = await resetPassword(fd({ password: 'short', confirmPassword: 'short' }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.field).toBe('password');
    }
    expect(supabaseMocks.auth.updateUser).not.toHaveBeenCalled();
  });

  it('rejects mismatched passwords', async () => {
    const result = await resetPassword(
      fd({ password: 'pw12345!', confirmPassword: 'different!' }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.field).toBe('confirmPassword');
    }
  });

  it('on success calls updateUser, revalidates and redirects to /login?reset=ok', async () => {
    supabaseMocks.auth.updateUser.mockResolvedValueOnce({
      data: { user: { id: 'u1' } },
      error: null,
    });

    await expect(
      resetPassword(fd({ password: 'pw12345!', confirmPassword: 'pw12345!' })),
    ).rejects.toThrow('NEXT_REDIRECT');

    expect(supabaseMocks.auth.updateUser).toHaveBeenCalledWith({ password: 'pw12345!' });
    expect(cacheMocks.revalidatePath).toHaveBeenCalledWith('/', 'layout');
    expect(navMocks.redirect).toHaveBeenCalledWith('/login?reset=ok');
  });

  it('surfaces Supabase error as a form error', async () => {
    supabaseMocks.auth.updateUser.mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'Auth session missing', status: 401 },
    });

    const result = await resetPassword(
      fd({ password: 'pw12345!', confirmPassword: 'pw12345!' }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.field).toBe('form');
    }
  });
});
