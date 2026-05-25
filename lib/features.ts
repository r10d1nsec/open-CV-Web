/**
 * Feature flags — gates de funcionalidad opcional.
 *
 * Flags públicos (con `NEXT_PUBLIC_*`) son visibles tanto en server como
 * client. El valor `'true'` (string) activa la feature; cualquier otra cosa
 * (incluido undefined) la deja apagada — comportamiento "secure by default".
 *
 * Para activar en Vercel: project → Settings → Environment Variables.
 * Para activar en local: `.env.local`.
 */

function isFlagOn(value: string | undefined): boolean {
  return value === 'true' || value === '1';
}

/**
 * Google OAuth en login/signup. Cuando OFF, el botón "Continuar con Google"
 * no se renderiza y los usuarios solo pueden entrar con email/password.
 *
 * Decisión: arrancamos OFF en MVP educativo. Se activa post-deploy cuando
 * el OAuth Client esté configurado en Google Cloud Console + Supabase
 * Dashboard (ADR-0005). El código (action + componente) está en su sitio,
 * listo para reactivar con un cambio de env var.
 */
export function isGoogleOAuthEnabled(): boolean {
  return isFlagOn(process.env.NEXT_PUBLIC_ENABLE_GOOGLE_OAUTH);
}
