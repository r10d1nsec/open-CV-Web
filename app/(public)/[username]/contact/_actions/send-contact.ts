'use server';

/**
 * Server Action: enviar contact form al alumno (Sprint 6 S6.3).
 *
 * Flujo:
 *   1. Resolver username → profile (incluye email_public + is_published).
 *   2. Validar honeypot — si relleno, devuelve { ok: true } silencioso.
 *   3. Validar zod (name, email, message).
 *   4. Rate-limit por IP+profile (in-memory por defecto).
 *   5. Insert en `contact_messages` (estado delivered=false).
 *   6. Si Resend está configurado y el alumno tiene email_public →
 *      enviar email; marcar delivered=true (o delivery_err).
 *   7. Devolver { ok: true } al cliente.
 *
 * Refs: spec:012, adr:0003 (RLS).
 */

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { ContactSchema } from '@/lib/validation/contact';
import { checkContactRateLimit, rateLimitKey } from '@/lib/rate-limit/contact';
import { hasResend, hashIp, sendContactEmail } from '@/lib/email/resend';
import { SITE_DOMAIN, EMAIL_FROM } from '@/lib/site';

export type ContactActionResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

const FROM_DEFAULT = EMAIL_FROM;

async function clientIp(): Promise<string> {
  const h = await headers();
  const xff = h.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]?.trim() ?? 'unknown';
  return h.get('x-real-ip') ?? 'unknown';
}

export async function sendContact(
  username: string,
  _prev: ContactActionResult | null,
  fd: FormData,
): Promise<ContactActionResult> {
  // 1) Resolver perfil destino.
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, full_name, email_public, is_published')
    .eq('username', username)
    .maybeSingle();
  if (!profile) return { ok: false, error: 'Perfil no encontrado.' };
  if (!profile.is_published) {
    return { ok: false, error: 'Este perfil aún no está disponible.' };
  }

  // 2) Honeypot — respuesta silenciosa.
  const honeypot = (fd.get('honeypot') as string | null) ?? '';
  if (honeypot.trim().length > 0) {
    // Devuelve ok=true para que el bot no pueda diferenciar éxito de bloqueo.
    return { ok: true };
  }

  // 3) Validar.
  const parsed = ContactSchema.safeParse({
    name: fd.get('name'),
    email: fd.get('email'),
    message: fd.get('message'),
    honeypot,
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join('.') || '_root';
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      ok: false,
      error: 'Revisa los campos marcados.',
      fieldErrors,
    };
  }

  // 4) Rate-limit.
  const ip = await clientIp();
  const ipHash = await hashIp(ip);
  const rate = await checkContactRateLimit(rateLimitKey(ipHash, profile.id));
  if (!rate.ok) {
    const mins = Math.ceil(rate.retryInSec / 60);
    return {
      ok: false,
      error: `Has alcanzado el límite de mensajes desde tu red. Inténtalo en ${mins} min.`,
    };
  }

  // 5) Insert (anon insert OK por RLS — destino es perfil publicado).
  const { data: inserted, error: insErr } = await supabase
    .from('contact_messages')
    .insert({
      profile_id: profile.id,
      sender_name: parsed.data.name,
      sender_email: parsed.data.email,
      message: parsed.data.message,
      ip_hash: ipHash,
    })
    .select('id')
    .single();
  if (insErr || !inserted) {
    return { ok: false, error: 'No se pudo guardar el mensaje.' };
  }

  // 6) Email vía Resend (graceful si no configurado o si falla).
  if (hasResend() && profile.email_public) {
    const subject = `Nuevo contacto desde ${SITE_DOMAIN}/${profile.username}`;
    const text = [
      `${parsed.data.name} (${parsed.data.email}) te ha escrito:`,
      '',
      parsed.data.message,
      '',
      '— ',
      `Responde directamente a este email para contactar.`,
      `${SITE_DOMAIN}/${profile.username}`,
    ].join('\n');
    const result = await sendContactEmail({
      to: profile.email_public,
      from: FROM_DEFAULT,
      replyTo: parsed.data.email,
      subject,
      text,
    });

    // Actualizar delivered con admin client para bypass RLS (no hay policy update).
    try {
      const admin = await createAdminClient();
      await admin
        .from('contact_messages')
        .update(
          result.ok
            ? { delivered: true }
            : { delivered: false, delivery_err: result.error },
        )
        .eq('id', inserted.id);
    } catch {
      // Best-effort — si el admin client no está disponible, dejamos el
      // estado default (delivered=false) y seguimos.
    }
  }

  revalidatePath(`/${profile.username}/contact`);
  return { ok: true };
}
