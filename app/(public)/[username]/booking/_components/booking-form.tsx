'use client';

import { useActionState, useMemo, useState } from 'react';
import { Input, Textarea } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field } from '@/app/(dashboard)/dashboard/edit/_components/section-shell';
import {
  generateSlots,
  formatMin,
  type AvailabilityRule,
  type BlockingBooking,
} from '@/lib/booking/slots';
import {
  createBooking,
  type BookingResult,
} from '@/app/(public)/[username]/booking/_actions/create-booking';

type Service = { externalId: string; name: string; minutes: number };

function formatDate(dateISO: string): string {
  return new Intl.DateTimeFormat('es-ES', {
    timeZone: 'Europe/Madrid', weekday: 'short', day: 'numeric', month: 'short',
  }).format(new Date(`${dateISO}T12:00:00Z`));
}

export function BookingForm({
  username,
  services,
  rules,
  blocking,
  today,
}: {
  username: string;
  services: Service[];
  rules: AvailabilityRule[];
  blocking: BlockingBooking[];
  today: { date: string; min: number };
}) {
  const [serviceId, setServiceId] = useState(services[0]?.externalId ?? '');
  const [picked, setPicked] = useState<{ date: string; startMin: number } | null>(null);
  const [state, formAction] = useActionState<BookingResult | null, FormData>(
    (prev, fd) => createBooking(prev, fd),
    null,
  );

  const service = services.find((s) => s.externalId === serviceId) ?? services[0];

  const slots = useMemo(() => {
    if (!service) return [];
    return generateSlots({
      rules, booked: blocking, durationMinutes: service.minutes,
      startDate: today.date, days: 21, now: today,
    });
  }, [service, rules, blocking, today]);

  // Agrupar por fecha.
  const byDate = useMemo(() => {
    const map = new Map<string, number[]>();
    for (const s of slots) map.set(s.date, [...(map.get(s.date) ?? []), s.startMin]);
    return [...map.entries()];
  }, [slots]);

  if (state?.ok) {
    return (
      <Card style={{ padding: 24 }}>
        <h2 style={{ margin: '0 0 6px', fontSize: 18, color: 'var(--success)' }}>Solicitud enviada ✓</h2>
        <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: 14 }}>
          Recibirás un email cuando se confirme tu reserva. ¡Gracias!
        </p>
      </Card>
    );
  }

  return (
    <form action={formAction} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Honeypot */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden style={{ position: 'absolute', left: '-9999px', width: 1, height: 1 }} />
      <input type="hidden" name="username" value={username} />
      <input type="hidden" name="serviceExternalId" value={service?.externalId ?? ''} />
      <input type="hidden" name="serviceName" value={service?.name ?? ''} />
      <input type="hidden" name="durationMinutes" value={service?.minutes ?? 30} />
      <input type="hidden" name="slotDate" value={picked?.date ?? ''} />
      <input type="hidden" name="startMin" value={picked?.startMin ?? ''} />

      {/* Servicio */}
      {services.length > 1 && (
        <div>
          <p style={{ fontSize: 12.5, color: 'var(--text-dim)', margin: '0 0 8px' }}>Servicio</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {services.map((s) => (
              <button key={s.externalId} type="button" onClick={() => { setServiceId(s.externalId); setPicked(null); }}
                aria-pressed={serviceId === s.externalId} className="card"
                style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 13,
                  borderColor: serviceId === s.externalId ? 'var(--accent)' : 'var(--border)',
                  boxShadow: serviceId === s.externalId ? '0 0 0 3px var(--accent-soft)' : 'var(--shadow-sm)' }}>
                {s.name} · {s.minutes} min
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Slots */}
      <div>
        <p style={{ fontSize: 12.5, color: 'var(--text-dim)', margin: '0 0 8px' }}>Elige un hueco (hora de España)</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 320, overflow: 'auto' }}>
          {byDate.map(([date, mins]) => (
            <div key={date}>
              <div className="mono" style={{ fontSize: 11, color: 'var(--text-faint)', marginBottom: 6, textTransform: 'capitalize' }}>{formatDate(date)}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {mins.map((m) => {
                  const active = picked?.date === date && picked?.startMin === m;
                  return (
                    <button key={m} type="button" onClick={() => setPicked({ date, startMin: m })} aria-pressed={active}
                      className="btn btn-sm" style={{
                        background: active ? 'var(--accent)' : 'var(--surface-2)',
                        color: active ? '#fff' : 'var(--text)',
                        border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}` }}>
                      {formatMin(m)}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Datos */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Tu nombre" name="name"><Input name="name" required maxLength={80} placeholder="Nombre y apellidos" /></Field>
        <Field label="Tu email" name="email"><Input name="email" type="email" required maxLength={120} placeholder="tu@email.com" /></Field>
      </div>
      <Field label="Mensaje (opcional)" name="message">
        <Textarea name="message" rows={3} maxLength={500} placeholder="Cuéntale brevemente qué necesitas." />
      </Field>

      {state && !state.ok && (
        <p role="alert" style={{ margin: 0, color: 'var(--danger)', fontSize: 13 }}>{state.error}</p>
      )}
      <div>
        <Button type="submit" variant="primary" size="lg" disabled={!picked}>
          {picked ? `Solicitar ${formatDate(picked.date)} · ${formatMin(picked.startMin)}` : 'Elige un hueco'}
        </Button>
      </div>
    </form>
  );
}
