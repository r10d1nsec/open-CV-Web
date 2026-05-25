'use server';

/**
 * Server Actions de gestión de booking del dueño (spec:007 re-scoped).
 *  - updateAvailability: replace-all de las franjas semanales.
 *  - setBookingStatus: confirmar/rechazar una reserva (RLS garantiza propiedad);
 *    al confirmar/rechazar avisa al visitante por email (Resend, si configurado).
 *
 * Refs: migración 0008, lib/validation/booking.ts.
 */
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { AvailabilitySchema } from '@/lib/validation/booking';
import { hasResend, sendContactEmail } from '@/lib/email/resend';
import { formatMin } from '@/lib/booking/slots';
import { EMAIL_FROM } from '@/lib/site';

export type ActionResult = { ok: true } | { ok: false; error: string };

async function ownedProfile() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return { ok: false as const, error: 'No has iniciado sesión.' };
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, full_name, email_public')
    .eq('user_id', user.id)
    .maybeSingle();
  if (!profile) return { ok: false as const, error: 'Perfil no encontrado.' };
  return { ok: true as const, supabase, profile };
}

export async function updateAvailability(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const owned = await ownedProfile();
  if (!owned.ok) return { ok: false, error: owned.error };
  const { supabase, profile } = owned;

  const rules: { weekday: number; startMin: number; endMin: number }[] = [];
  let i = 0;
  while (fd.has(`rules[${i}][weekday]`)) {
    rules.push({
      weekday: Number(fd.get(`rules[${i}][weekday]`)),
      startMin: Number(fd.get(`rules[${i}][startMin]`)),
      endMin: Number(fd.get(`rules[${i}][endMin]`)),
    });
    i += 1;
  }
  const parsed = AvailabilitySchema.safeParse({ rules });
  if (!parsed.success) return { ok: false, error: 'Revisa las franjas: el fin debe ser posterior al inicio.' };

  const { error: delErr } = await supabase.from('availability_rules').delete().eq('profile_id', profile.id);
  if (delErr) return { ok: false, error: 'No se pudo actualizar (paso 1).' };

  const rows = parsed.data.rules.map((r, idx) => ({
    profile_id: profile.id,
    weekday: r.weekday,
    start_min: r.startMin,
    end_min: r.endMin,
    position: idx,
  }));
  if (rows.length > 0) {
    const { error: insErr } = await supabase.from('availability_rules').insert(rows);
    if (insErr) return { ok: false, error: 'No se pudo guardar la disponibilidad.' };
  }

  revalidatePath('/dashboard/booking');
  revalidatePath(`/${profile.username}/booking`);
  return { ok: true };
}

export async function setBookingStatus(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
  const owned = await ownedProfile();
  if (!owned.ok) return { ok: false, error: owned.error };
  const { supabase, profile } = owned;

  const id = String(fd.get('id') ?? '');
  const status = String(fd.get('status') ?? '');
  if (!id || (status !== 'confirmed' && status !== 'rejected')) {
    return { ok: false, error: 'Acción no válida.' };
  }

  const { data: booking, error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', id)
    .eq('profile_id', profile.id)
    .select('booker_name, booker_email, service_name, slot_date, start_min')
    .maybeSingle();
  if (error || !booking) return { ok: false, error: 'No se pudo actualizar la reserva.' };

  // Aviso al visitante (best-effort).
  if (hasResend() && profile.email_public) {
    const when = `${booking.slot_date} a las ${formatMin(booking.start_min)} (hora de España)`;
    const decided = status === 'confirmed' ? 'confirmada' : 'rechazada';
    await sendContactEmail({
      to: booking.booker_email,
      from: EMAIL_FROM,
      replyTo: profile.email_public,
      subject: `Tu reserva con ${profile.full_name} ha sido ${decided}`,
      text: `Hola ${booking.booker_name},\n\nTu solicitud${booking.service_name ? ` de "${booking.service_name}"` : ''} para el ${when} ha sido ${decided}.\n\n${profile.full_name}`,
    });
  }

  revalidatePath('/dashboard/booking');
  return { ok: true };
}
