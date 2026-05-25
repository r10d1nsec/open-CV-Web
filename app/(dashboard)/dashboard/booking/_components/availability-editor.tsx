'use client';

import { useActionState, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useFormStatus } from 'react-dom';
import {
  updateAvailability,
  type ActionResult,
} from '@/app/(dashboard)/dashboard/booking/_actions/booking-admin';

const WEEKDAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

type Range = { weekday: number; start: string; end: string }; // start/end = "HH:MM"

function toHHMM(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}
function toMin(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function SaveBar({ state }: { state: ActionResult | null }) {
  const { pending } = useFormStatus();
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
      <output role="status" aria-live="polite" style={{ fontSize: 13 }}>
        {state?.ok === true && <span style={{ color: 'var(--success)' }}>Guardado ✓</span>}
        {state?.ok === false && <span role="alert" style={{ color: 'var(--danger)' }}>{state.error}</span>}
      </output>
      <Button type="submit" variant="primary" size="md" disabled={pending}>
        {pending ? 'Guardando…' : 'Guardar disponibilidad'}
      </Button>
    </div>
  );
}

export function AvailabilityEditor({ initial }: { initial: { weekday: number; startMin: number; endMin: number }[] }) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    (prev, fd) => updateAvailability(prev ?? { ok: true }, fd),
    null,
  );
  const [ranges, setRanges] = useState<Range[]>(
    initial.map((r) => ({ weekday: r.weekday, start: toHHMM(r.startMin), end: toHHMM(r.endMin) })),
  );

  function add(weekday: number) {
    setRanges((p) => [...p, { weekday, start: '09:00', end: '14:00' }]);
  }
  function patch(i: number, patch: Partial<Range>) {
    setRanges((p) => p.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  function remove(i: number) {
    setRanges((p) => p.filter((_, idx) => idx !== i));
  }

  return (
    <form action={formAction} noValidate>
      {ranges.map((r, i) => (
        <span key={i} style={{ display: 'none' }}>
          <input type="hidden" name={`rules[${i}][weekday]`} value={r.weekday} />
          <input type="hidden" name={`rules[${i}][startMin]`} value={toMin(r.start)} />
          <input type="hidden" name={`rules[${i}][endMin]`} value={toMin(r.end)} />
        </span>
      ))}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {WEEKDAYS.map((label, wd) => {
          const dayRanges = ranges.map((r, i) => ({ r, i })).filter(({ r }) => r.weekday === wd);
          return (
            <div key={wd} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ width: 96, fontSize: 13.5, paddingTop: 7, color: 'var(--text-dim)' }}>{label}</div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {dayRanges.length === 0 && (
                  <span style={{ fontSize: 12.5, color: 'var(--text-faint)', paddingTop: 7 }}>Cerrado</span>
                )}
                {dayRanges.map(({ r, i }) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="time" value={r.start} onChange={(e) => patch(i, { start: e.target.value })} className="input" style={{ width: 120 }} aria-label={`Inicio ${label}`} />
                    <span style={{ color: 'var(--text-faint)' }}>—</span>
                    <input type="time" value={r.end} onChange={(e) => patch(i, { end: e.target.value })} className="input" style={{ width: 120 }} aria-label={`Fin ${label}`} />
                    <Button type="button" variant="ghost" size="sm" onClick={() => remove(i)} aria-label={`Quitar franja de ${label}`}>Quitar</Button>
                  </div>
                ))}
                <div><Button type="button" variant="ghost" size="sm" onClick={() => add(wd)}>+ Añadir franja</Button></div>
              </div>
            </div>
          );
        })}
      </div>
      <SaveBar state={state} />
    </form>
  );
}
