/**
 * Configuración de sitio por entorno (open-source).
 *
 * Define el dominio público y el remitente de email vía variables de entorno,
 * para que cualquier fork funcione en su propio dominio sin tocar el código.
 *
 *   NEXT_PUBLIC_SITE_URL  → URL pública (ej. https://tudominio.com). En Vercel
 *                           puedes ponerla a tu dominio; en local cae a localhost.
 *   EMAIL_FROM            → remitente de Resend (ej. "Folio <hi@tudominio.com>").
 *                           Debe ser de un dominio verificado en Resend.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

/** URL absoluta del sitio + path opcional. */
export function siteUrl(path = ''): string {
  return `${SITE_URL}${path}`;
}

/** Dominio sin protocolo ni barra final — para mostrar en la UI. */
export const SITE_DOMAIN = SITE_URL.replace(/^https?:\/\//, '');

/** Remitente de email (Resend). Dominio verificado requerido. */
export const EMAIL_FROM = process.env.EMAIL_FROM || 'Folio <onboarding@resend.dev>';
