'use client';

import { useActionState, useState } from 'react';
import { Input, Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  updateExperience,
  type ActionResult,
} from '@/app/(dashboard)/dashboard/edit/_actions/update-profile';
import type { ExperienceInput } from '@/lib/validation/profile';
import { Field, SectionShell } from '@/app/(dashboard)/dashboard/edit/_components/section-shell';
import { RowCard, move } from '@/app/(dashboard)/dashboard/edit/_components/row-list';

type Row = { role: string; org: string; period: string; blurb: string; current: boolean };

const empty: Row = { role: '', org: '', period: '', blurb: '', current: false };

export function ExperienceSection({ initial }: { initial: ExperienceInput }) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    (prev, fd) => updateExperience(prev ?? { ok: true }, fd),
    null,
  );
  const [rows, setRows] = useState<Row[]>(
    initial.items.map((i) => ({ ...i, blurb: i.blurb ?? '' })),
  );
  const fe = state && !state.ok ? state.fieldErrors : undefined;

  function patch(i: number, p: Partial<Row>) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...p } : r)));
  }

  return (
    <form action={formAction} noValidate>
      <SectionShell
        title="Experiencia"
        subtitle="Tu trayectoria profesional o académica. Hasta 15 entradas, ordénalas con ↑ ↓."
        state={state}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {rows.length === 0 && (
            <p style={{ margin: 0, color: 'var(--text-faint)', fontSize: 13 }}>
              Aún no has añadido experiencia. Añade tu primer puesto abajo.
            </p>
          )}
          {rows.map((r, i) => (
            <RowCard
              key={i}
              index={i}
              total={rows.length}
              label="Puesto"
              onMoveUp={() => setRows((p) => move(p, i, i - 1))}
              onMoveDown={() => setRows((p) => move(p, i, i + 1))}
              onRemove={() => setRows((p) => p.filter((_, idx) => idx !== i))}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Field label="Rol" name={`items[${i}][role]`} error={fe?.[`items.${i}.role`]}>
                  <Input name={`items[${i}][role]`} value={r.role} onChange={(e) => patch(i, { role: e.target.value })} placeholder="Frontend developer" maxLength={80} />
                </Field>
                <Field label="Organización" name={`items[${i}][org]`} error={fe?.[`items.${i}.org`]}>
                  <Input name={`items[${i}][org]`} value={r.org} onChange={(e) => patch(i, { org: e.target.value })} placeholder="Acme Studio" maxLength={80} />
                </Field>
              </div>
              <Field label="Periodo" name={`items[${i}][period]`} error={fe?.[`items.${i}.period`]}>
                <Input name={`items[${i}][period]`} value={r.period} onChange={(e) => patch(i, { period: e.target.value })} placeholder="2023 — Actual" maxLength={40} />
              </Field>
              <Field label="Descripción" name={`items[${i}][blurb]`} error={fe?.[`items.${i}.blurb`]}>
                <Textarea name={`items[${i}][blurb]`} value={r.blurb} onChange={(e) => patch(i, { blurb: e.target.value })} rows={2} maxLength={300} placeholder="Qué hiciste, con qué impacto." />
              </Field>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-dim)' }}>
                <input type="checkbox" name={`items[${i}][current]`} checked={r.current} onChange={(e) => patch(i, { current: e.target.checked })} />
                Puesto actual
              </label>
            </RowCard>
          ))}
          <div>
            <Button type="button" variant="secondary" size="sm" onClick={() => setRows((p) => [...p, { ...empty }])} disabled={rows.length >= 15}>
              + Añadir experiencia
            </Button>
          </div>
        </div>
      </SectionShell>
    </form>
  );
}
