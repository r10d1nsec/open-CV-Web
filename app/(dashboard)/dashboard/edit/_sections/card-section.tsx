'use client';

import { useActionState, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  updateCard,
  updateCardLinks,
  type ActionResult,
} from '@/app/(dashboard)/dashboard/edit/_actions/update-profile';
import type { CardInput, CardLinksInput } from '@/lib/validation/profile';
import type { CardLinkIcon, CardStyle } from '@/types/profile';
import { Field, SectionShell } from '@/app/(dashboard)/dashboard/edit/_components/section-shell';
import { RowCard, move } from '@/app/(dashboard)/dashboard/edit/_components/row-list';

const STYLES: { value: CardStyle; label: string; hint: string }[] = [
  { value: 'aurora', label: 'Aurora', hint: 'Gradiente vivo con tu acento' },
  { value: 'minimal', label: 'Minimal', hint: 'Sobrio, acento en detalles' },
  { value: 'mesh', label: 'Mesh', hint: 'Malla de color premium' },
];

const ICONS: CardLinkIcon[] = ['web', 'link', 'calendar', 'doc', 'shop', 'pay', 'chat', 'video', 'music', 'map', 'telegram', 'whatsapp'];

type LinkRow = { icon: CardLinkIcon; label: string; url: string };

export function CardSection({ card, links }: { card: CardInput; links: CardLinksInput }) {
  // Form A — ajustes de la card
  const [stateA, actionA] = useActionState<ActionResult | null, FormData>(
    (prev, fd) => updateCard(prev ?? { ok: true }, fd),
    null,
  );
  const [style, setStyle] = useState<CardStyle>(card.cardStyle);

  // Form B — enlaces personalizados
  const [stateB, actionB] = useActionState<ActionResult | null, FormData>(
    (prev, fd) => updateCardLinks(prev ?? { ok: true }, fd),
    null,
  );
  const [rows, setRows] = useState<LinkRow[]>(
    links.items.map((l) => ({ icon: l.icon, label: l.label, url: l.url })),
  );
  const feB = stateB && !stateB.ok ? stateB.fieldErrors : undefined;

  function patch(i: number, p: Partial<LinkRow>) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...p } : r)));
  }

  return (
    <>
      <form action={actionA} noValidate>
        <SectionShell
          title="Tu tarjeta digital"
          subtitle="Estilo, WhatsApp y datos que se muestran en /c/tu-usuario."
          state={stateA}
        >
          <input type="hidden" name="cardStyle" value={style} />
          <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
            <legend style={{ fontSize: 12.5, color: 'var(--text-dim)', marginBottom: 8 }}>Estilo de la tarjeta</legend>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {STYLES.map((s) => (
                <button key={s.value} type="button" onClick={() => setStyle(s.value)} aria-pressed={style === s.value}
                  className="card" style={{ padding: '10px 14px', textAlign: 'left', cursor: 'pointer', borderColor: style === s.value ? 'var(--accent)' : 'var(--border)', boxShadow: style === s.value ? '0 0 0 3px var(--accent-soft)' : 'var(--shadow-sm)' }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500 }}>{s.label}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>{s.hint}</div>
                </button>
              ))}
            </div>
          </fieldset>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Empresa (opcional)" name="company">
              <Input name="company" defaultValue={card.company ?? ''} maxLength={80} placeholder="ARCODE" />
            </Field>
            <Field label="WhatsApp (opcional)" name="whatsapp" hint="Con prefijo. Ej.: +34 603 053 689">
              <Input name="whatsapp" defaultValue={card.whatsapp ?? ''} maxLength={30} placeholder="+34…" inputMode="tel" />
            </Field>
          </div>
          <Field label="Mensaje pre-relleno de WhatsApp (opcional)" name="whatsappMessage">
            <Input name="whatsappMessage" defaultValue={card.whatsappMessage ?? ''} maxLength={200} placeholder="Hola, vi tu tarjeta y…" />
          </Field>
        </SectionShell>
      </form>

      <form action={actionB} noValidate>
        <SectionShell
          title="Enlaces de la tarjeta"
          subtitle="Cualquier enlace que quieras mostrar (web, agenda, catálogo, pago…). Hasta 12."
          state={stateB}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {rows.length === 0 && (
              <p style={{ margin: 0, color: 'var(--text-faint)', fontSize: 13 }}>Aún no has añadido enlaces.</p>
            )}
            {rows.map((r, i) => (
              <RowCard key={i} index={i} total={rows.length} label="Enlace"
                onMoveUp={() => setRows((p) => move(p, i, i - 1))}
                onMoveDown={() => setRows((p) => move(p, i, i + 1))}
                onRemove={() => setRows((p) => p.filter((_, idx) => idx !== i))}>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 10 }}>
                  <Field label="Icono" name={`items[${i}][icon]`}>
                    <select name={`items[${i}][icon]`} value={r.icon} onChange={(e) => patch(i, { icon: e.target.value as CardLinkIcon })}
                      className="input" style={{ height: 38 }}>
                      {ICONS.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
                    </select>
                  </Field>
                  <Field label="Texto" name={`items[${i}][label]`} error={feB?.[`items.${i}.label`]}>
                    <Input name={`items[${i}][label]`} value={r.label} onChange={(e) => patch(i, { label: e.target.value })} placeholder="Agenda una llamada" maxLength={40} />
                  </Field>
                </div>
                <Field label="URL" name={`items[${i}][url]`} error={feB?.[`items.${i}.url`]}>
                  <Input name={`items[${i}][url]`} value={r.url} onChange={(e) => patch(i, { url: e.target.value })} placeholder="https://…" inputMode="url" />
                </Field>
              </RowCard>
            ))}
            <div>
              <Button type="button" variant="secondary" size="sm" onClick={() => setRows((p) => [...p, { icon: 'link', label: '', url: '' }])} disabled={rows.length >= 12}>
                + Añadir enlace
              </Button>
            </div>
          </div>
        </SectionShell>
      </form>
    </>
  );
}
