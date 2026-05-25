# ADR-0005: Google OAuth como segundo proveedor de auth

- **Status**: accepted, **gated OFF by default until post-deploy** (2026-05-24)
- **Date**: 2026-05-24
- **Deciders**: r10d1n
- **Related ADRs**: ADR-0002 (auth & session strategy)
- **Related specs**: spec:001 (auth), spec:012 (contact form Sprint 6)

## Estado operativo

El código está implementado y testeado pero **deshabilitado por feature flag** (`NEXT_PUBLIC_ENABLE_GOOGLE_OAUTH`). El botón "Continuar con Google" no aparece en login/signup hasta que el flag se ponga a `true` en el entorno.

**Razón**: la plataforma se va a desplegar primero con auth solo email/password para evitar bloqueos por dependencia de configuración externa (Google Cloud Console + Supabase Dashboard). Una vez desplegada y accesible públicamente con dominio definitivo (`your-domain.com`), se completa el setup externo y se activa el flag — sin necesidad de tocar código ni redeploy del repo.

Para activar:
1. Completar los 3 pasos de "Configuración externa requerida" más abajo.
2. Setear `NEXT_PUBLIC_ENABLE_GOOGLE_OAUTH=true` en Vercel project envs.
3. Redeploy automático.

## Context

Sprint 3a entregó auth email/password contra Supabase. El feedback del caso de uso educativo (alumnos en transición laboral, mayoría con Gmail personal) sugiere fricción cuando se les pide crear "otra contraseña más".

Añadir Google OAuth reduce el friction de signup a un clic, mejora la conversión sin sacrificar seguridad (Supabase Auth maneja PKCE y refresh tokens igual que email/pwd), y mantiene el método tradicional como fallback para quien no tenga o no quiera usar Google.

## Decision

Habilitamos **Google OAuth** como proveedor secundario. Email/password sigue siendo el primario y aparece debajo de un separador "o con email" en los forms.

### Configuración externa requerida (operación manual)

1. **Google Cloud Console**: crear OAuth 2.0 Client ID tipo "Web application".
   - Authorized redirect URIs:
     - `http://localhost:3000/auth/callback` (dev)
     - `https://<your-supabase-ref>.supabase.co/auth/v1/callback` (Supabase intermediario)
     - `https://your-domain.com/auth/callback` (prod)
     - `https://*-vercel.app/auth/callback` (previews, opcional)
   - Anotar `client_id` y `client_secret`.

2. **Supabase Dashboard** → Authentication → Providers → Google:
   - Enable.
   - Pegar `client_id` y `client_secret`.
   - Skip nonce check: OFF (recomendado).

3. **No envs nuevas en el app** — toda la config vive en Supabase, no en el deploy.

### Implementación en el código

- **Server action `signInWithGoogle()`** (`app/(auth)/_actions/signin-google.ts`): llama `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: <origin>/auth/callback } })` y redirige al `data.url` que devuelve Supabase.
- **Botón `<GoogleButton />`** (Client Component) embebido en login y signup forms.
- **`/auth/callback`** ya soporta OAuth flow desde Sprint 3a (exchange code → set cookies → redirect a `/dashboard`).
- **El gate de onboarding** (Sprint 5) sigue siendo el mismo: callback → `/dashboard` → si `!onboarded_at` → `/onboarding`.

## Consequences

**Positivas**:

- Signup en 1 clic para la mayoría de alumnos.
- Sin cambios al data model ni al schema RLS.
- Sin nuevas deps npm (Supabase SDK ya soporta OAuth out of the box).
- Reversible: si OAuth da problemas, basta deshabilitar en Supabase Dashboard — el botón seguirá ahí pero las acciones devolverán error legible.

**Negativas / riesgos**:

- Dependencia de configuración externa (Google Cloud Console + Supabase Dashboard) — el deploy no es 100% reproducible solo desde el repo.
- Si Google cambia su consent screen review process (apps pasan a "in-production" requiere verification), puede haber fricción para alumnos. Para arrancar con la clase, dejamos la app en "Testing" con whitelist de emails — suficiente para 30-50 alumnos.
- Política de privacidad / términos requeridos por Google: tenemos placeholders en `/legal/*` (pendientes para Sprint 8 Harden).

**Por qué Google y no LinkedIn**:

- LinkedIn OAuth requiere LinkedIn Marketing Developer Platform approval — proceso pesado para MVP educativo.
- Apple Sign-In requiere Apple Developer membership ($99/año) — fuera de presupuesto.
- GitHub OAuth podría ser útil para alumnos dev, pero la mayoría de la clase no es dev — Google es más universal.

## Open questions

- ¿Añadir Apple Sign-In en v2 para usuarios iOS? Probablemente no — coste/beneficio no compensa para audiencia educativa.
- ¿Migrar alumnos existentes email→Google si quieren? Supabase soporta multi-factor identity linking. Defer a v1.1.

## Changelog interno

- 2026-05-24 — creado y aceptado. Vinculante para Sprint 6 S6.5.
