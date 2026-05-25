/**
 * Reserva pública — spec:007 re-scoped. Calcula los slots disponibles
 * (próximos 21 días, hora de España) desde availability_rules menos las
 * reservas pending/confirmed, y los pasa a un picker cliente.
 */
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getProfileByUsername } from '@/lib/profile-store';
import { isReservedSlug } from '@/lib/validation/reserved-slugs';
import { generateSlots, type AvailabilityRule, type BlockingBooking } from '@/lib/booking/slots';
import { BookingForm } from '@/app/(public)/[username]/booking/_components/booking-form';

type Params = { username: string };
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  return { title: profile ? `Reservar con ${profile.name}` : 'Folio' };
}

function madridToday(): { date: string; min: number } {
  const now = new Date();
  const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid' }).format(now);
  const hm = new Intl.DateTimeFormat('es-ES', {
    timeZone: 'Europe/Madrid', hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(now);
  const [h, m] = hm.split(':').map(Number);
  return { date, min: (h ?? 0) * 60 + (m ?? 0) };
}

export default async function BookingPage({ params }: { params: Promise<Params> }) {
  const { username } = await params;
  if (isReservedSlug(username)) notFound();
  const profile = await getProfileByUsername(username);
  if (!profile) notFound();

  const supabase = await createClient();
  const { data: prow } = await supabase.from('profiles').select('id').eq('username', username).maybeSingle();
  const profileId = prow?.id;

  // Servicios reservables: los que tienen duración en minutos.
  const bookable = profile.services
    .map((s) => ({ ...s, minutes: typeof s.duration === 'number' ? s.duration : null }))
    .filter((s): s is typeof s & { minutes: number } => s.minutes !== null);

  let availRules: AvailabilityRule[] = [];
  let blocking: BlockingBooking[] = [];
  if (profileId) {
    const { data: rules } = await supabase
      .from('availability_rules').select('weekday, start_min, end_min').eq('profile_id', profileId);
    const { data: taken } = await supabase
      .from('bookings').select('slot_date, start_min, duration_minutes')
      .eq('profile_id', profileId).in('status', ['pending', 'confirmed']);
    availRules = (rules ?? []).map((r) => ({ weekday: r.weekday, startMin: r.start_min, endMin: r.end_min }));
    blocking = (taken ?? []).map((t) => ({ date: t.slot_date, startMin: t.start_min, durationMinutes: t.duration_minutes }));
  }

  const today = madridToday();
  // Sondeo: ¿hay algún slot con la duración mínima? (para el empty-state).
  const probe = generateSlots({
    rules: availRules, booked: blocking,
    durationMinutes: Math.min(...(bookable.map((s) => s.minutes).length ? bookable.map((s) => s.minutes) : [30])),
    startDate: today.date, days: 21, now: today,
  });
  const hasAvailability = availRules.length > 0 && bookable.length > 0;

  return (
    <main style={{ minHeight: '100dvh', maxWidth: 720, marginInline: 'auto', padding: '48px 24px 64px' }}>
      <p className="mono" style={{ fontSize: 10.5, color: 'var(--text-faint)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
        Reservar · hora de España
      </p>
      <h1 style={{ fontSize: 28, margin: '6px 0 8px', letterSpacing: '-0.02em' }}>Reservar con {profile.name}</h1>
      <p style={{ margin: '0 0 24px', color: 'var(--text-dim)', fontSize: 14 }}>
        Elige un servicio y un hueco. {profile.name.split(' ')[0]} confirmará tu solicitud.
      </p>

      {!hasAvailability || probe.length === 0 ? (
        <p style={{ color: 'var(--text-faint)', fontSize: 14 }}>
          Ahora mismo no hay huecos disponibles. Prueba el{' '}
          <a href={`/${username}/contact`} style={{ color: 'var(--accent)' }}>formulario de contacto</a>.
        </p>
      ) : (
        <BookingForm
          username={username}
          services={bookable.map((s) => ({ externalId: s.id, name: s.name, minutes: s.minutes }))}
          rules={availRules}
          blocking={blocking}
          today={today}
        />
      )}
    </main>
  );
}
