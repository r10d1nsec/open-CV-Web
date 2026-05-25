'use client';

import { useActionState, useState } from 'react';
import { Input, Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  updateServices,
  type ActionResult,
} from '@/app/(dashboard)/dashboard/edit/_actions/update-profile';
import type { ServicesInput } from '@/lib/validation/profile';
import { Field, SectionShell } from '@/app/(dashboard)/dashboard/edit/_components/section-shell';
import { RowCard, move } from '@/app/(dashboard)/dashboard/edit/_components/row-list';

type Row = { name: string; duration: string; price: string; blurb: string; popular: boolean };

const empty: Row = { name: '', duration: '', price: '', blurb: '', popular: false };

export function ServicesSection({ initial }: { initial: ServicesInput }) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    (prev, fd) => updateServices(prev ?? { ok: true }, fd),
    null,
  );
  const [rows, setRows] = useState<Row[]>(
    initial.items.map((i) => ({ name: i.name, duration: i.duration, price: i.price, blurb: i.blurb ?? '', popular: i.popular })),
  );
  const fe = state && !state.ok ? state.fieldErrors : undefined;

  function patch(i: number, p: Partial<Row>) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...p } : r)));
  }

  return (
    <form action={formAction} noValidate>
      <SectionShell
        title="Servicios"
        subtitle="Lo que ofreces (para reservas). Hasta 12 servicios."
        state={state}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {rows.length === 0 && (
            <p style={{ margin: 0, color: 'var(--text-faint)', fontSize: 13 }}>
              Aún no has añadido servicios.
            </p>
          )}
          {rows.map((r, i) => (
            <RowCard
              key={i}
              index={i}
              total={rows.length}
              label="Servicio"
              onMoveUp={() => setRows((p) => move(p, i, i - 1))}
              onMoveDown={() => setRows((p) => move(p, i, i + 1))}
              onRemove={() => setRows((p) => p.filter((_, idx) => idx !== i))}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10 }}>
                <Field label="Nombre" name={`items[${i}][name]`} error={fe?.[`items.${i}.name`]}>
                  <Input name={`items[${i}][name]`} value={r.name} onChange={(e) => patch(i, { name: e.target.value })} placeholder="Sesión de mentoría" maxLength={80} />
                </Field>
                <Field label="Duración" name={`items[${i}][duration]`} error={fe?.[`items.${i}.duration`]}>
                  <Input name={`items[${i}][duration]`} value={r.duration} onChange={(e) => patch(i, { duration: e.target.value })} placeholder="60 min" maxLength={40} />
                </Field>
                <Field label="Precio" name={`items[${i}][price]`} error={fe?.[`items.${i}.price`]}>
                  <Input name={`items[${i}][price]`} value={r.price} onChange={(e) => patch(i, { price: e.target.value })} placeholder="€90 · Gratis" maxLength={40} />
                </Field>
              </div>
              <Field label="Descripción" name={`items[${i}][blurb]`} error={fe?.[`items.${i}.blurb`]}>
                <Textarea name={`items[${i}][blurb]`} value={r.blurb} onChange={(e) => patch(i, { blurb: e.target.value })} rows={2} maxLength={300} placeholder="Qué incluye." />
              </Field>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-dim)' }}>
                <input type="checkbox" name={`items[${i}][popular]`} checked={r.popular} onChange={(e) => patch(i, { popular: e.target.checked })} />
                Marcar como popular
              </label>
            </RowCard>
          ))}
          <div>
            <Button type="button" variant="secondary" size="sm" onClick={() => setRows((p) => [...p, { ...empty }])} disabled={rows.length >= 12}>
              + Añadir servicio
            </Button>
          </div>
        </div>
      </SectionShell>
    </form>
  );
}
