/**
 * Tests for avatar file validation.
 *
 * Refs: spec:002 §Implementation, Sprint 4 S4.7.
 */
import { describe, expect, it } from 'vitest';
import { validateAvatarFile, MAX_AVATAR_BYTES } from '@/lib/storage/avatar';

function fakeFile({
  name = 'photo.png',
  type = 'image/png',
  size = 1024,
}: Partial<{ name: string; type: string; size: number }> = {}): File {
  // Construye un File en memoria con el `size` solicitado (bytes vacíos).
  const blob = new Blob([new Uint8Array(size)], { type });
  return new File([blob], name, { type });
}

describe('validateAvatarFile', () => {
  it('accepts a small PNG', () => {
    expect(validateAvatarFile(fakeFile({ type: 'image/png', size: 50_000 }))).toEqual({
      ok: true,
    });
  });

  it('accepts JPEG, WEBP, GIF', () => {
    expect(validateAvatarFile(fakeFile({ type: 'image/jpeg' })).ok).toBe(true);
    expect(validateAvatarFile(fakeFile({ type: 'image/webp' })).ok).toBe(true);
    expect(validateAvatarFile(fakeFile({ type: 'image/gif' })).ok).toBe(true);
  });

  it('rejects non-image MIME types', () => {
    const res = validateAvatarFile(fakeFile({ type: 'application/pdf', name: 'cv.pdf' }));
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toMatch(/im[aá]gen/i);
  });

  it('rejects files larger than MAX_AVATAR_BYTES', () => {
    const res = validateAvatarFile(fakeFile({ size: MAX_AVATAR_BYTES + 1 }));
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toMatch(/2.*MB/i);
  });

  it('accepts file exactly at the boundary', () => {
    expect(validateAvatarFile(fakeFile({ size: MAX_AVATAR_BYTES })).ok).toBe(true);
  });

  it('rejects empty files', () => {
    const res = validateAvatarFile(fakeFile({ size: 0 }));
    expect(res.ok).toBe(false);
  });
});
