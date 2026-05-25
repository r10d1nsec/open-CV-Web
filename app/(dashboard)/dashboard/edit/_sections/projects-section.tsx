'use client';

import { useActionState, useState } from 'react';
import { Input, Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  updateProjects,
  type ActionResult,
} from '@/app/(dashboard)/dashboard/edit/_actions/update-profile';
import type { ProjectsInput } from '@/lib/validation/profile';
import { Field, SectionShell } from '@/app/(dashboard)/dashboard/edit/_components/section-shell';
import { RowCard, move } from '@/app/(dashboard)/dashboard/edit/_components/row-list';

type Row = {
  title: string;
  tag: string;
  blurb: string;
  stack: string;
  color: string;
  githubUrl: string;
  liveUrl: string;
  highlight: boolean;
};

const empty: Row = { title: '', tag: '', blurb: '', stack: '', color: '#3b82f6', githubUrl: '', liveUrl: '', highlight: false };

export function ProjectsSection({ initial }: { initial: ProjectsInput }) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    (prev, fd) => updateProjects(prev ?? { ok: true }, fd),
    null,
  );
  const [rows, setRows] = useState<Row[]>(
    initial.items.map((i) => ({
      title: i.title,
      tag: i.tag ?? '',
      blurb: i.blurb ?? '',
      stack: i.stack.join(', '),
      color: i.color,
      githubUrl: i.githubUrl ?? '',
      liveUrl: i.liveUrl ?? '',
      highlight: i.highlight,
    })),
  );
  const fe = state && !state.ok ? state.fieldErrors : undefined;

  function patch(i: number, p: Partial<Row>) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...p } : r)));
  }

  return (
    <form action={formAction} noValidate>
      <SectionShell
        title="Proyectos"
        subtitle="Tu mejor trabajo. Hasta 12 proyectos. El color tiñe la tarjeta en tu portfolio."
        state={state}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {rows.length === 0 && (
            <p style={{ margin: 0, color: 'var(--text-faint)', fontSize: 13 }}>
              Aún no has añadido proyectos. Muestra tu mejor trabajo abajo.
            </p>
          )}
          {rows.map((r, i) => (
            <RowCard
              key={i}
              index={i}
              total={rows.length}
              label="Proyecto"
              onMoveUp={() => setRows((p) => move(p, i, i - 1))}
              onMoveDown={() => setRows((p) => move(p, i, i + 1))}
              onRemove={() => setRows((p) => p.filter((_, idx) => idx !== i))}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
                <Field label="Título" name={`items[${i}][title]`} error={fe?.[`items.${i}.title`]}>
                  <Input name={`items[${i}][title]`} value={r.title} onChange={(e) => patch(i, { title: e.target.value })} placeholder="Folio" maxLength={80} />
                </Field>
                <Field label="Etiqueta" name={`items[${i}][tag]`} error={fe?.[`items.${i}.tag`]}>
                  <Input name={`items[${i}][tag]`} value={r.tag} onChange={(e) => patch(i, { tag: e.target.value })} placeholder="SaaS · App" maxLength={40} />
                </Field>
              </div>
              <Field label="Descripción" name={`items[${i}][blurb]`} error={fe?.[`items.${i}.blurb`]}>
                <Textarea name={`items[${i}][blurb]`} value={r.blurb} onChange={(e) => patch(i, { blurb: e.target.value })} rows={2} maxLength={300} placeholder="Qué resuelve y tu rol." />
              </Field>
              <Field label="Stack (separado por comas)" name={`items[${i}][stack]`} error={fe?.[`items.${i}.stack`]}>
                <Input name={`items[${i}][stack]`} value={r.stack} onChange={(e) => patch(i, { stack: e.target.value })} placeholder="React, TypeScript, Tailwind" />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Field label="URL repositorio" name={`items[${i}][githubUrl]`} error={fe?.[`items.${i}.githubUrl`]}>
                  <Input name={`items[${i}][githubUrl]`} value={r.githubUrl} onChange={(e) => patch(i, { githubUrl: e.target.value })} placeholder="https://github.com/…" inputMode="url" />
                </Field>
                <Field label="URL demo" name={`items[${i}][liveUrl]`} error={fe?.[`items.${i}.liveUrl`]}>
                  <Input name={`items[${i}][liveUrl]`} value={r.liveUrl} onChange={(e) => patch(i, { liveUrl: e.target.value })} placeholder="https://…" inputMode="url" />
                </Field>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <Field label="Color" name={`items[${i}][color]`} error={fe?.[`items.${i}.color`]}>
                  <input type="color" name={`items[${i}][color]`} value={r.color} onChange={(e) => patch(i, { color: e.target.value })} style={{ width: 48, height: 32, border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', background: 'transparent', cursor: 'pointer' }} aria-label={`Color del proyecto ${i + 1}`} />
                </Field>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-dim)' }}>
                  <input type="checkbox" name={`items[${i}][highlight]`} checked={r.highlight} onChange={(e) => patch(i, { highlight: e.target.checked })} />
                  Destacado
                </label>
              </div>
            </RowCard>
          ))}
          <div>
            <Button type="button" variant="secondary" size="sm" onClick={() => setRows((p) => [...p, { ...empty }])} disabled={rows.length >= 12}>
              + Añadir proyecto
            </Button>
          </div>
        </div>
      </SectionShell>
    </form>
  );
}
