/**
 * Tests for the username validator.
 *
 * Refs: spec:002 §Non-functional (regex), spec:011 §Non-functional,
 * Sprint 5 S5.2.
 */
import { describe, expect, it } from 'vitest';
import { UsernameSchema, validateUsername, normalizeUsername } from '@/lib/validation/username';

describe('UsernameSchema', () => {
  it.each(['maya', 'maria-garcia', 'user42', 'a1', 'abcdefghij0123456789-x'])(
    'accepts valid username %s',
    (u) => {
      expect(UsernameSchema.parse(u)).toBe(u);
    },
  );

  it.each([
    ['', 'empty'],
    ['a', 'too short'],
    ['x'.repeat(31), 'too long'],
    ['Maya', 'uppercase'],
    ['maya garcia', 'whitespace'],
    ['-maya', 'leading dash'],
    ['maya-', 'trailing dash'],
    ['ma--ya', 'double dash'],
    ['maría', 'non-ascii'],
    ['ma.ya', 'dot'],
    ['ma_ya', 'underscore'],
  ])('rejects invalid username %s (%s)', (u) => {
    expect(() => UsernameSchema.parse(u)).toThrow();
  });
});

describe('validateUsername', () => {
  it('accepts a clean valid username', () => {
    expect(validateUsername('maria-garcia')).toEqual({ ok: true, value: 'maria-garcia' });
  });

  it('returns format error for invalid regex (post-normalize)', () => {
    const res = validateUsername('-maria-');
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.code).toBe('format');
  });

  it('normalizes mixed case but still validates (Maria → maria → ok)', () => {
    expect(validateUsername('Maria')).toEqual({ ok: true, value: 'maria' });
  });

  it('returns reserved error for reserved slugs (case-insensitive)', () => {
    expect(validateUsername('dashboard')).toMatchObject({ ok: false, code: 'reserved' });
    expect(validateUsername('Login')).toMatchObject({ ok: false, code: 'reserved' });
    expect(validateUsername('API')).toMatchObject({ ok: false, code: 'reserved' });
  });

  it('rejects the placeholder user-<id> pattern (must be claimed)', () => {
    const res = validateUsername('user-abc12345');
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.code).toBe('reserved');
  });

  it('normalizes case + trim before checking', () => {
    expect(validateUsername('  MARIA-GARCIA  ')).toEqual({ ok: true, value: 'maria-garcia' });
  });
});

describe('normalizeUsername', () => {
  it('lowercases + trims', () => {
    expect(normalizeUsername('  Maya  ')).toBe('maya');
  });
  it('passes through valid lowercase as-is', () => {
    expect(normalizeUsername('maria-garcia')).toBe('maria-garcia');
  });
});
