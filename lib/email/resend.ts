/**
 * Resend email helper — Sprint 6 S6.3.
 *
 * - `hasResend()` returns true iff `RESEND_API_KEY` is present.
 * - `sendContactEmail({...})` envía el email vía Resend. Si no hay API key,
 *   devuelve `{ ok: false, error: 'resend-not-configured' }` para que el
 *   caller pueda decidir (typical: graceful degrade — guardar mensaje en
 *   DB de todas formas).
 *
 * El paquete `resend` se importa lazy para no inflar el bundle si no se usa.
 *
 * Refs: spec:012 §Design (Resend), ADR-0001 (stack).
 */

export function hasResend(): boolean {
  return typeof process.env.RESEND_API_KEY === 'string' && process.env.RESEND_API_KEY.length > 0;
}

export type EmailPayload = {
  to: string;
  from: string;
  replyTo?: string;
  subject: string;
  text: string;
  html?: string;
};

export type SendResult = { ok: true; id?: string } | { ok: false; error: string };

export async function sendContactEmail(payload: EmailPayload): Promise<SendResult> {
  if (!hasResend()) {
    return { ok: false, error: 'resend-not-configured' };
  }
  try {
    const { Resend } = await import('resend');
    const client = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await client.emails.send({
      to: payload.to,
      from: payload.from,
      replyTo: payload.replyTo,
      subject: payload.subject,
      text: payload.text,
      html: payload.html ?? payload.text,
    });
    if (error) return { ok: false, error: error.message ?? 'resend-error' };
    return { ok: true, id: data?.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: msg };
  }
}

/**
 * SHA-256 hash of `ip` truncado a 16 chars hex. Para guardar en `ip_hash`
 * sin doxxear al sender.
 */
export async function hashIp(ip: string): Promise<string> {
  const data = new TextEncoder().encode(ip);
  const buf = await crypto.subtle.digest('SHA-256', data);
  const hex = Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return hex.slice(0, 16);
}
