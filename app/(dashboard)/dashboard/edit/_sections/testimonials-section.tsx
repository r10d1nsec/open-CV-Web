'use client';

import { useActionState, useState } from 'react';
import { Input, Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  updateTestimonials,
  type ActionResult,
} from '@/app/(dashboard)/dashboard/edit/_actions/update-profile';
import type { TestimonialsInput } from '@/lib/validation/profile';
import { Field, SectionShell } from '@/app/(dashboard)/dashboard/edit/_components/section-shell';
import { RowCard, move } from '@/app/(dashboard)/dashboard/edit/_components/row-list';

type Row = { quote: string; author: string; org: string };

const empty: Row = { quote: '', author: '', org: '' };

export function TestimonialsSection({ initial }: { initial: TestimonialsInput }) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    (prev, fd) => updateTestimonials(prev ?? { ok: true }, fd),
    null,
  );
  const [rows, setRows] = useState<Row[]>(
    initial.items.map((i) => ({ quote: i.quote, author: i.author, org: i.org ?? '' })),
  );
  const fe = state && !state.ok ? state.fieldErrors : undefined;

  function patch(i: number, p: Partial<Row>) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...p } : r)));
  }

  return (
    <form action={formAction} noValidate>
      <SectionShell
        title="Testimonios"
        subtitle="Recomendaciones de profes, mentores o clientes. Hasta 12."
        state={state}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {rows.length === 0 && (
            <p style={{ margin: 0, color: 'var(--text-faint)', fontSize: 13 }}>
              Aún no has añadido testimonios.
            </p>
          )}
          {rows.map((r, i) => (
            <RowCard
              key={i}
              index={i}
              total={rows.length}
              label="Testimonio"
              onMoveUp={() => setRows((p) => move(p, i, i - 1))}
              onMoveDown={() => setRows((p) => move(p, i, i + 1))}
              onRemove={() => setRows((p) => p.filter((_, idx) => idx !== i))}
            >
              <Field label="Cita" name={`items[${i}][quote]`} error={fe?.[`items.${i}.quote`]}>
                <Textarea name={`items[${i}][quote]`} value={r.quote} onChange={(e) => patch(i, { quote: e.target.value })} rows={2} maxLength={400} placeholder="Trabajó con dedicación y entregó por encima de lo esperado." />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Field label="Autor" name={`items[${i}][author]`} error={fe?.[`items.${i}.author`]}>
                  <Input name={`items[${i}][author]`} value={r.author} onChange={(e) => patch(i, { author: e.target.value })} placeholder="Laura Gómez" maxLength={80} />
                </Field>
                <Field label="Organización" name={`items[${i}][org]`} error={fe?.[`items.${i}.org`]}>
                  <Input name={`items[${i}][org]`} value={r.org} onChange={(e) => patch(i, { org: e.target.value })} placeholder="Tutora · Acme" maxLength={80} />
                </Field>
              </div>
            </RowCard>
          ))}
          <div>
            <Button type="button" variant="secondary" size="sm" onClick={() => setRows((p) => [...p, { ...empty }])} disabled={rows.length >= 12}>
              + Añadir testimonio
            </Button>
          </div>
        </div>
      </SectionShell>
    </form>
  );
}
