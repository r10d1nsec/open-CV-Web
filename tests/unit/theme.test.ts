/**
 * Tests de la derivación de CSS vars del theming por perfil (spec:014).
 */
import { describe, expect, it } from 'vitest';
import { themeVars } from '@/lib/theme';

describe('themeVars', () => {
  it('derives accent vars from a hex', () => {
    const v = themeVars('#3b82f6', 'plus-jakarta') as Record<string, string>;
    expect(v['--accent']).toBe('#3b82f6');
    expect(v['--accent-rgb']).toBe('59, 130, 246');
    expect(v['--accent-soft']).toBe('rgba(59, 130, 246, 0.12)');
    expect(v['--accent-glow']).toBe('rgba(59, 130, 246, 0.35)');
  });

  it('falls back to default rgb on a bad hex', () => {
    const v = themeVars('nope', 'inter') as Record<string, string>;
    expect(v['--accent-rgb']).toBe('59, 130, 246');
  });

  it('sets the font stack and explicit fontFamily for each family', () => {
    const jakarta = themeVars('#000000', 'plus-jakarta') as Record<string, string>;
    const inter = themeVars('#000000', 'inter') as Record<string, string>;
    const tiempos = themeVars('#000000', 'tiempos') as Record<string, string>;
    expect(jakarta.fontFamily).toContain('Plus Jakarta');
    expect(inter.fontFamily).toContain('Inter');
    expect(tiempos.fontFamily).toContain('serif');
    expect(jakarta['--font-sans']).toBe(jakarta.fontFamily);
  });
});
