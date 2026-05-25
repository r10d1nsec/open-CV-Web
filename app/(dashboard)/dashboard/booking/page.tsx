/**
 * Gestión de booking del dueño — spec:007 re-scoped.
 * Disponibilidad semanal + bandeja de reservas (pending arriba, aprobar/rechazar).
 */
import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Metadata, Route } from 'next';
import { requireUser } from '@/lib/auth';
import { getCurrentProfile } from '@/lib/profile-store';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { Pill } from '@/components/ui/pill';
import { formatMin } from '@/lib/booking/slots';
import { AvailabilityEditor } from '@/app/(dashboard)/dashboard/booking/_components/availability-editor';
import { BookingActions } from '@/app/(dashboard)/dashboard/booking/_components/booking-actions';

export const metadata: Metadata = { title: 'Reservas · Folio' };
export const dynamic = 'force-dynamic';

type Booking = {
  id: string; service_name: string; slot_date: string; start_min: number;
  booker_name: string; booker_email: string; message: string; status: string;
};

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente', confirmed: 'Confirmada', rejected: 'Rechazada', cancelled: 'Cancelada',
};

function fmtDate(d: string) {
  return new Intl.DateTimeFormat('es-ES', { timeZone: 'Europe/Madrid', weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(`${d}T12:00:00Z`));
}

export default async function DashboardBookingPage() {
  await requireUser('/dashboard/booking');
  const profile = await getCurrentProfile();
  if (!profile || !profile.onboardedAt) redirect('/onboarding');

  const supabase = await createClient();
  const { data: prow } = await supabase.from('profiles').select('id').eq('user_id', (await supabase.auth.getUser()).data.user?.id ?? '').maybeSingle();
  const profileId = prow?.id;

  const { data: rules } = profileId
    ? await supabase.from('availability_rules').select('weekday, start_min, end_min').eq('profile_id', profileId).order('weekday')
    : { data: [] };
  const { data: bookings } = profileId
    ? await supabase.from('bookings').select('id, service_name, slot_date, start_min, booker_name, booker_email, message, status').eq('profile_id', profileId).order('slot_date', { ascending: true }).limit(100)
    : { data: [] };

  const initial = (rules ?? []).map((r) => ({ weekday: r.weekday, startMin: r.start_min, endMin: r.end_min }));
  const list = (bookings ?? []) as Booking[];
  const pending = list.filter((b) => b.status === 'pending');
  const rest = list.filter((b) => b.status !== 'pending');

  return (
    <main style={{ minHeight: '100dvh', maxWidth: 820, marginInline: 'auto', padding: '32px 24px 64px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <p className="mono" style={{ fontSize: 10.5, color: 'var(--text-faint)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>Reservas</p>
          <h1 style={{ fontSize: 28, margin: '4px 0 0', letterSpacing: '-0.02em' }}>Tu calendario</h1>
        </div>
        <Link href={'/dashboard' as Route} style={{ fontSize: 13, color: 'var(--text-dim)', textDecoration: 'none' }}>← Volver al dashboard</Link>
      </header>

      <Card style={{ padding: 24 }}>
        <h2 style={{ margin: '0 0 4px', fontSize: 16 }}>Disponibilidad semanal</h2>
        <p style={{ margin: '0 0 16px', color: 'var(--text-dim)', fontSize: 13 }}>
          Define tus franjas (hora de España). Los visitantes solo verán huecos dentro de ellas. Los slots usan la duración de cada servicio.
        </p>
        <AvailabilityEditor initial={initial} />
      </Card>

      <Card style={{ padding: 24 }}>
        <h2 style={{ margin: '0 0 12px', fontSize: 16 }}>
          Solicitudes {pending.length > 0 && <Pill style={{ color: 'var(--warning)' }}>{pending.length} pendiente{pending.length > 1 ? 's' : ''}</Pill>}
        </h2>
        {list.length === 0 ? (
          <p style={{ margin: 0, color: 'var(--text-faint)', fontSize: 13 }}>Aún no tienes reservas.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[...pending, ...rest].map((b) => (
              <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: 12, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>
                    {b.booker_name} · <span className="mono" style={{ fontSize: 12.5, color: 'var(--text-faint)' }}>{b.booker_email}</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 2 }}>
                    {b.service_name || 'Reserva'} — {fmtDate(b.slot_date)} · {formatMin(b.start_min)}
                  </div>
                  {b.message && <p style={{ margin: '6px 0 0', fontSize: 12.5, color: 'var(--text-faint)' }}>{b.message}</p>}
                </div>
                {b.status === 'pending'
                  ? <BookingActions id={b.id} />
                  : <Pill style={{ color: b.status === 'confirmed' ? 'var(--success)' : 'var(--text-faint)' }}>{STATUS_LABEL[b.status]}</Pill>}
              </div>
            ))}
          </div>
        )}
      </Card>
    </main>
  );
}
