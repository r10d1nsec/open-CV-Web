/**
 * /auth/callback route handler — happy + failure paths + open-redirect guard.
 *
 * Refs: spec:001 T7, adr:0002
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const supabaseMocks = vi.hoisted(() => {
  const auth = { exchangeCodeForSession: vi.fn() };
  return { auth, createClient: vi.fn(async () => ({ auth })) };
});

vi.mock('@/lib/supabase/server', () => ({
  createClient: supabaseMocks.createClient,
}));

import { GET } from '@/app/auth/callback/route';

function makeRequest(href: string): Parameters<typeof GET>[0] {
  return new Request(href) as unknown as Parameters<typeof GET>[0];
}

beforeEach(() => {
  supabaseMocks.auth.exchangeCodeForSession.mockReset();
});

describe('GET /auth/callback', () => {
  it('redirects to /login?error=callback_missing_code when code is absent', async () => {
    const res = await GET(makeRequest('http://localhost:3000/auth/callback'));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe(
      'http://localhost:3000/login?error=callback_missing_code',
    );
    expect(supabaseMocks.auth.exchangeCodeForSession).not.toHaveBeenCalled();
  });

  it('exchanges the code and redirects to /dashboard on success (default for onboarding gate)', async () => {
    supabaseMocks.auth.exchangeCodeForSession.mockResolvedValueOnce({ data: {}, error: null });
    const res = await GET(makeRequest('http://localhost:3000/auth/callback?code=abc123'));
    expect(supabaseMocks.auth.exchangeCodeForSession).toHaveBeenCalledWith('abc123');
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost:3000/dashboard');
  });

  it('redirects to /login?error=callback_failed when exchange errors', async () => {
    supabaseMocks.auth.exchangeCodeForSession.mockResolvedValueOnce({
      data: {},
      error: { message: 'invalid grant', status: 400 },
    });
    const res = await GET(makeRequest('http://localhost:3000/auth/callback?code=bad'));
    expect(res.headers.get('location')).toBe('http://localhost:3000/login?error=callback_failed');
  });

  it('honours ?next when it is a same-origin path', async () => {
    supabaseMocks.auth.exchangeCodeForSession.mockResolvedValueOnce({ data: {}, error: null });
    const res = await GET(
      makeRequest('http://localhost:3000/auth/callback?code=abc&next=/dashboard'),
    );
    expect(res.headers.get('location')).toBe('http://localhost:3000/dashboard');
  });

  it('falls back to /dashboard when ?next points to an external origin (open-redirect guard)', async () => {
    supabaseMocks.auth.exchangeCodeForSession.mockResolvedValueOnce({ data: {}, error: null });
    const res = await GET(
      makeRequest('http://localhost:3000/auth/callback?code=abc&next=https://evil.com/x'),
    );
    expect(res.headers.get('location')).toBe('http://localhost:3000/dashboard');
  });

  it('falls back to /dashboard when ?next is a protocol-relative URL', async () => {
    supabaseMocks.auth.exchangeCodeForSession.mockResolvedValueOnce({ data: {}, error: null });
    const res = await GET(
      makeRequest('http://localhost:3000/auth/callback?code=abc&next=//evil.com/x'),
    );
    expect(res.headers.get('location')).toBe('http://localhost:3000/dashboard');
  });
});
