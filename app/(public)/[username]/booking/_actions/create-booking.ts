'use server';

/**
 * Crear reserva (pública) — spec:007 re-scoped.
 *
 * Flujo: validar → honeypot → rate-limit por IP+perfil → re-verificar que el
 * slot está dentro de la disponibilidad y libre (anti-tamper) → insertar como
 * 'pending' → avisar al dueño por email (best-effort).
 *
 * Refs: lib/booking/slots.ts, migración 0008, patrón de send-contact.
 */
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { BookingSchema } from '@/lib/validation/booking';
import { generateSlots, type AvailabilityRule, type BlockingBooking } from '@/lib/booking/slots';
import { checkRateLimit } from '@/lib/rate-limit/core';
import { hasResend, hashIp, sendContactEmail } from '@/lib/email/resend';
import { EMAIL_FROM } from '@/lib/site';

export type BookingResult = { ok: true } | { ok: false; error: string };

const FROM = EMAIL_FROM;

async function clientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0]?.trim() || 'unknown';
  return h.get('x-real-ip') ?? 'unknown';
}

export async function createBooking(_prev: BookingResult | null, fd: FormData): Promise<BookingResult> {
  // Honeypot (campo oculto que solo rellenan bots).
  if (String(fd.get('company') ?? '').length > 0) return { ok: true };

  const parsed = BookingSchema.safeParse({
    serviceExternalId: fd.get('serviceExternalId'),
    serviceName: fd.get('serviceName'),
    slotDate: fd.get('slotDate'),
    startMin: fd.get('startMin'),
    durationMinutes: fd.get('durationMinutes'),
    name: fd.get('name'),
    email: fd.get('email'),
    message: fd.get('message'),
  });
  if (!parsed.success) return { ok: false, error: 'Revisa los datos de la reserva.' };
  const b = parsed.data;

  const username = String(fd.get('username') ?? '');
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, email_public, is_published')
    .eq('username', username)
    .maybeSingle();
  if (!profile || !profile.is_published) return { ok: false, error: 'Perfil no disponible.' };

  // Rate-limit (5/IP+perfil/hora).
  const ipHash = await hashIp(await clientIp());
  const limit = await checkRateLimit(`booking:${ipHash}:${profile.id}`, { limit: 5, windowSec: 3600 });
  if (!limit.ok) return { ok: false, error: 'Demasiadas solicitudes. Inténtalo más tarde.' };

  // Re-verificar disponibilidad server-side (anti-tamper).
  const { data: rules } = await supabase
    .from('availability_rules')
    .select('weekday, start_min, end_min')
    .eq('profile_id', profile.id);
  const { data: taken } = await supabase
    .from('bookings')
    .select('slot_date, start_min, duration_minutes')
    .eq('profile_id', profile.id)
    .in('status', ['pending', 'confirmed'])
    .eq('slot_date', b.slotDate);

  const availRules: AvailabilityRule[] = (rules ?? []).map((r) => ({
    weekday: r.weekday,
    startMin: r.start_min,
    endMin: r.end_min,
  }));
  const blocking: BlockingBooking[] = (taken ?? []).map((t) => ({
    date: t.slot_date,
    startMin: t.start_min,
    durationMinutes: t.duration_minutes,
  }));
  const slots = generateSlots({
    rules: availRules,
    booked: blocking,
    durationMinutes: b.durationMinutes,
    startDate: b.slotDate,
    days: 1,
  });
  const valid = slots.some((s) => s.date === b.slotDate && s.startMin === b.startMin);
  if (!valid) return { ok: false, error: 'Ese hueco ya no está disponible. Elige otro.' };

  const { error: insErr } = await supabase.from('bookings').insert({
    profile_id: profile.id,
    service_external_id: b.serviceExternalId ?? null,
    service_name: b.serviceName ?? '',
    slot_date: b.slotDate,
    start_min: b.startMin,
    duration_minutes: b.durationMinutes,
    booker_name: b.name,
    booker_email: b.email,
    message: b.message ?? '',
    status: 'pending',
  });
  if (insErr) return { ok: false, error: 'No se pudo registrar la reserva. Inténtalo de nuevo.' };

  // Aviso al dueño (best-effort).
  if (hasResend() && profile.email_public) {
    await sendContactEmail({
      to: profile.email_public,
      from: FROM,
      replyTo: b.email,
      subject: `Nueva solicitud de reserva de ${b.name}`,
      text: `${b.name} (${b.email}) quiere reservar${b.serviceName ? ` "${b.serviceName}"` : ''} el ${b.slotDate}.\n\n${b.message || '(sin mensaje)'}\n\nConfírmala o recházala en tu dashboard → Reservas.`,
    });
  }

  return { ok: true };
}
