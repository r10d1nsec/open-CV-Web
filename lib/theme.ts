/**
 * Theming por perfil (spec:014). Convierte la personalización guardada
 * (accent hex + font family) en CSS custom properties que se inyectan inline
 * en un wrapper del portfolio público, sobreescribiendo los tokens del design
 * system SIN tocar `styles/design-system.css` (que sigue siendo el contrato).
 *
 * Refs: adr:0006 (theming), styles/design-system.css.
 */
import type { CSSProperties } from 'react';
import type { FontFamily } from '@/types/profile';

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#([0-9a-fA-F]{6})$/.exec(hex);
  if (!m || !m[1]) return [59, 130, 246];
  const int = parseInt(m[1], 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

function lighten([r, g, b]: [number, number, number], amount: number): string {
  const mix = (c: number) => Math.round(c + (255 - c) * amount);
  return `#${[mix(r), mix(g), mix(b)].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

const FONT_STACKS: Record<FontFamily, string> = {
  'plus-jakarta': "'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
  inter: "Inter, 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
  tiempos: "'Tiempos Text', Georgia, 'Times New Roman', serif",
};

/** CSS vars derivadas del color de acento + fuente del perfil. */
export function themeVars(accentColor: string, fontFamily: FontFamily): CSSProperties {
  const rgb = hexToRgb(accentColor);
  return {
    '--accent': accentColor,
    '--accent-hover': lighten(rgb, 0.18),
    '--accent-rgb': rgb.join(', '),
    '--accent-soft': `rgba(${rgb.join(', ')}, 0.12)`,
    '--accent-glow': `rgba(${rgb.join(', ')}, 0.35)`,
    '--font-sans': FONT_STACKS[fontFamily],
    // fontFamily explícito para que cascadee a los hijos (cambiar solo la var
    // no re-aplica font-family ya heredada del body).
    fontFamily: FONT_STACKS[fontFamily],
  } as CSSProperties;
}
