'use client';

import { useActionState, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import {
  updateBrand,
  type ActionResult,
} from '@/app/(dashboard)/dashboard/edit/_actions/update-profile';
import type { BrandInput } from '@/lib/validation/profile';
import type { FontFamily, LayoutVariant, SectionKey } from '@/types/profile';
import { SectionShell } from '@/app/(dashboard)/dashboard/edit/_components/section-shell';
import { move } from '@/app/(dashboard)/dashboard/edit/_components/row-list';

const ACCENT_PRESETS = ['#3b82f6', '#14b8a6', '#8b5cf6', '#a3e635', '#f97316', '#f43f5e', '#ec4899', '#22d3ee'];

const FONTS: { value: FontFamily; label: string; hint: string }[] = [
  { value: 'plus-jakarta', label: 'Plus Jakarta', hint: 'Sans geométrica (por defecto)' },
  { value: 'inter', label: 'Inter', hint: 'Neutra, técnica' },
  { value: 'tiempos', label: 'Tiempos', hint: 'Serif editorial' },
];

const LAYOUTS: { value: LayoutVariant; label: string; hint: string }[] = [
  { value: 'default', label: 'Default', hint: 'Una columna, hero arriba' },
  { value: 'sidebar', label: 'Sidebar', hint: 'Identidad fija a la izquierda (próximamente)' },
  { value: 'minimal', label: 'Minimal', hint: 'Tipográfico, sin tarjetas (próximamente)' },
];

const SECTION_LABELS: Record<SectionKey, string> = {
  hero: 'Cabecera',
  skills: 'Skills',
  experience: 'Experiencia',
  projects: 'Proyectos',
  testimonials: 'Testimonios',
  services: 'Servicios',
  contact: 'Contacto',
};

const LOCKED: SectionKey[] = ['hero', 'contact']; // siempre visibles

export function BrandSection({ initial }: { initial: BrandInput }) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    (prev, fd) => updateBrand(prev ?? { ok: true }, fd),
    null,
  );
  const [accent, setAccent] = useState(initial.accentColor);
  const [font, setFont] = useState<FontFamily>(initial.fontFamily);
  const [layout, setLayout] = useState<LayoutVariant>(initial.layoutVariant);
  const [order, setOrder] = useState<SectionKey[]>([...initial.sectionOrder]);
  const [hidden, setHidden] = useState<Set<SectionKey>>(new Set(initial.sectionHidden));

  function toggleHidden(key: SectionKey) {
    if (LOCKED.includes(key)) return;
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <form action={formAction} noValidate>
      <SectionShell
        title="Tu marca"
        subtitle="Color de acento, tipografía, layout y qué secciones se muestran. Se reflejan al instante en tu portfolio público."
        state={state}
      >
        {/* Hidden inputs serializados */}
        <input type="hidden" name="accentColor" value={accent} />
        <input type="hidden" name="fontFamily" value={font} />
        <input type="hidden" name="layoutVariant" value={layout} />
        <input type="hidden" name="sectionOrder" value={order.join(',')} />
        <input type="hidden" name="sectionHidden" value={[...hidden].join(',')} />

        {/* Acento */}
        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend style={{ fontSize: 12.5, color: 'var(--text-dim)', marginBottom: 8 }}>Color de acento</legend>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {ACCENT_PRESETS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setAccent(c)}
                aria-label={`Acento ${c}`}
                aria-pressed={accent.toLowerCase() === c.toLowerCase()}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 'var(--r-md)',
                  background: c,
                  border: accent.toLowerCase() === c.toLowerCase() ? '2px solid var(--text)' : '1px solid var(--border)',
                  cursor: 'pointer',
                }}
              />
            ))}
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} aria-label="Color personalizado" style={{ width: 34, height: 30, border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', background: 'transparent', cursor: 'pointer' }} />
              <Input value={accent} onChange={(e) => setAccent(e.target.value)} aria-label="Hex del acento" style={{ width: 110 }} className="mono" />
            </label>
          </div>
        </fieldset>

        {/* Fuente */}
        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend style={{ fontSize: 12.5, color: 'var(--text-dim)', marginBottom: 8 }}>Tipografía</legend>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {FONTS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFont(f.value)}
                aria-pressed={font === f.value}
                className="card"
                style={{
                  padding: '10px 14px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  borderColor: font === f.value ? 'var(--accent)' : 'var(--border)',
                  boxShadow: font === f.value ? '0 0 0 3px var(--accent-soft)' : 'var(--shadow-sm)',
                }}
              >
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{f.label}</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>{f.hint}</div>
              </button>
            ))}
          </div>
        </fieldset>

        {/* Layout */}
        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend style={{ fontSize: 12.5, color: 'var(--text-dim)', marginBottom: 8 }}>Layout</legend>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {LAYOUTS.map((l) => (
              <button
                key={l.value}
                type="button"
                onClick={() => setLayout(l.value)}
                aria-pressed={layout === l.value}
                className="card"
                style={{
                  padding: '10px 14px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  borderColor: layout === l.value ? 'var(--accent)' : 'var(--border)',
                  boxShadow: layout === l.value ? '0 0 0 3px var(--accent-soft)' : 'var(--shadow-sm)',
                }}
              >
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{l.label}</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>{l.hint}</div>
              </button>
            ))}
          </div>
        </fieldset>

        {/* Secciones: orden + visibilidad */}
        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend style={{ fontSize: 12.5, color: 'var(--text-dim)', marginBottom: 8 }}>
            Secciones — orden y visibilidad
          </legend>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {order.map((key, i) => {
              const isHidden = hidden.has(key);
              const locked = LOCKED.includes(key);
              return (
                <div
                  key={key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--r-md)',
                    opacity: isHidden ? 0.55 : 1,
                  }}
                >
                  <Icon name="grip" size={15} style={{ color: 'var(--text-faint)' }} />
                  <span style={{ flex: 1, fontSize: 13.5 }}>{SECTION_LABELS[key]}</span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setOrder((p) => move(p, i, i - 1))} disabled={i === 0} aria-label={`Subir ${SECTION_LABELS[key]}`}>
                    <Icon name="arrowDown" size={12} style={{ transform: 'rotate(180deg)' }} />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setOrder((p) => move(p, i, i + 1))} disabled={i === order.length - 1} aria-label={`Bajar ${SECTION_LABELS[key]}`}>
                    <Icon name="arrowDown" size={12} />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleHidden(key)}
                    disabled={locked}
                    aria-pressed={!isHidden}
                    aria-label={`${isHidden ? 'Mostrar' : 'Ocultar'} ${SECTION_LABELS[key]}`}
                  >
                    <Icon name={isHidden ? 'eyeOff' : 'eye'} size={14} />
                  </Button>
                </div>
              );
            })}
          </div>
          <p style={{ margin: '8px 0 0', fontSize: 11.5, color: 'var(--text-faint)' }}>
            Cabecera y Contacto siempre se muestran.
          </p>
        </fieldset>
      </SectionShell>
    </form>
  );
}
