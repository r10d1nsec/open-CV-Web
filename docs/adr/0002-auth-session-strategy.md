# ADR-0002: Auth & session strategy — Supabase Auth + @supabase/ssr

- **Status**: accepted
- **Date**: 2026-05-22
- **Deciders**: r10d1n (founder)
- **Related specs**: spec:001 (auth)
- **Related ADRs**: ADR-0001 (stack base)

## Context

Sprint 3 introduce auth real por primera vez. ADR-0001 ya ratificó Supabase como BaaS, pero no detalló:

1. **Qué librería cliente de Supabase usar** en Next.js App Router (las APIs viejas — `@supabase/auth-helpers-nextjs` — están deprecated desde mediados de 2024).
2. **Cómo modelar la sesión SSR** sin romper rutas públicas (`/u/:username`, `/card/:username`, `/u/:username/booking`, `/api/card/:username/*`).
3. **Qué métodos de auth** habilitar en el primer corte y cuáles diferir.
4. **Si construir un dashboard de auth propio o usar un servicio como Clerk** que reduzca código.

Sub-sprints:

- 3a — Auth (esta decisión).
- 3b — Schema + RLS (ADR-0003).
- 3c — Migrar `profile-store.ts` mock → Supabase.

## Decision

Adoptamos las siguientes decisiones para auth y sesión:

### 1. Librería: `@supabase/ssr` + `@supabase/supabase-js`

- `@supabase/ssr` es el sucesor oficial de `@supabase/auth-helpers-nextjs`. Gestiona cookies httpOnly en Next.js App Router con el patrón de **three clients**:
  - **server client** (`createServerClient`) en Server Components, Server Actions, Route Handlers — lee/escribe cookies vía `next/headers`.
  - **browser client** (`createBrowserClient`) en Client Components que necesiten `onAuthStateChange` (logout, refresco reactivo de UI).
  - **middleware client** invocado desde `middleware.ts` raíz para refrescar la sesión en cada request.

Ubicación canónica:

```
lib/supabase/
  client.ts       # createBrowserClient
  server.ts       # createServerClient (cookies de next/headers)
  middleware.ts   # createServerClient con cookies del request/response del middleware
```

### 2. Métodos de auth en Sprint 3a: solo email + password

- Signup, login, logout, forgot password, reset password.
- Confirmación de email obligatoria (default de Supabase Auth, habilitable/deshabilitable por entorno en el dashboard del proyecto).
- Magic links: **fuera**. No queremos un segundo flujo de auth en MVP — la decisión es tener un único path predecible.
- Google OAuth: **diferido** a un sub-sprint posterior (3d o Sprint 4). Requiere Google Cloud project + OAuth consent screen, que el usuario aún no tiene listo. El código del callback se diseñará para acomodarlo sin refactor.
- 2FA, SSO empresarial, magic links como método primario: **v1**.

### 3. Sesión y cookies

- Tokens en cookies **httpOnly + Secure + SameSite=Lax** gestionadas por `@supabase/ssr`.
- `middleware.ts` raíz refresca el access token cuando falta < 5 min para expirar. Matcher excluye assets estáticos, `_next/*` y `api/card/*` (endpoints públicos de QR/vCard, que no necesitan refresh y deben mantenerse rápidos y cacheables).
- Sesión leída server-side (Server Components, Server Actions) con `supabase.auth.getUser()` — nunca confiamos en `getSession()` para autorización (devuelve la sesión local sin re-validar contra Supabase).

### 4. Helpers en `lib/auth.ts`

- `getCurrentUser()` — devuelve `User | null`, sin redirect.
- `requireUser()` — devuelve `User` o `redirect('/login')`. Para usar en Server Components/Actions de rutas autenticadas.
- Sin abstracciones de roles/permissions todavía — single-tenant per-user, todo se modela via RLS (ver ADR-0003).

### 5. Server Actions sobre Route Handlers

- Las mutaciones de auth (signup, login, logout, reset) se hacen vía **Server Actions** consumidas desde forms con `action={signup}`. No exponemos endpoints REST propios en `/api/auth/*`.
- `/auth/callback/route.ts` es un Route Handler porque debe responder a Supabase con un redirect (no es invocado desde un form propio).

### 6. No usamos Clerk ni Auth0 en MVP

- Trade-off real evaluado: Clerk tiene mejor DX (componentes pre-construidos) y maneja edge cases (Bot detection, organizations) gratis. Pero:
  - Sumamos un vendor más al stack (ya tenemos Supabase + Vercel + Resend).
  - Coste mensual escala con MAUs.
  - Necesitaríamos doble sincronización entre Clerk users y Supabase RLS (Clerk JWT → claim → policy en Supabase).
  - Para email+password en MVP, Supabase Auth basta y reduce superficie.

## Consequences

**Positivas**:

- Single vendor para auth + DB + storage. Una sola fuente de verdad para `auth.users` referenciada por nuestras tablas vía FK.
- `@supabase/ssr` es el patrón oficial recomendado por Supabase y Vercel — alineado con docs y ejemplos actuales (skill `vercel:auth` y `vercel:nextjs`).
- Server Actions reducen boilerplate (sin endpoints REST + fetch + estado).
- RLS de Supabase puede usar `auth.uid()` directamente sin pasar claims custom.

**Negativas**:

- Acoplamiento a Supabase Auth: migrar a otro provider (ej. Clerk) requeriría tocar todas las queries que dependen de RLS + reemplazar Server Actions de auth.
- `@supabase/ssr` aún tiene rough edges en algunos casos exóticos (Edge Runtime, streaming) — no aplicables en nuestro stack (Fluid Compute, Server Components estándar).
- Sin componentes pre-construidos: cada formulario lo escribimos. En MVP es aceptable (5 forms total); en v1 con SSO + 2FA puede pesar.

**Riesgos a vigilar**:

- Confirmación por email puede romper UX en preview deployments si el dominio cambia. Mitigación: desactivar confirmación en proyectos de Supabase no-prod, dejarla solo en prod.
- Rate limiting: los defaults de Supabase Auth son suficientes para MVP pero hay que añadir rate limit propio en `/api/auth/*` en Sprint 11 antes de Launch.
- `getUser()` vs `getSession()` confusion: documentar explícitamente en `lib/auth.ts` que `getSession()` NO es seguro para autorización.

## Alternatives considered

- **Clerk** — mejor DX, pero suma vendor, coste por MAU y doble sincronización con RLS. Re-evaluar si en v1 necesitamos organizations/SSO empresarial.
- **Auth0** — overkill para single-dev MVP. Pricing más agresivo. No integra con RLS de Supabase tan limpiamente.
- **NextAuth.js / Auth.js** — buena alternativa, framework-agnostic. Pero implica gestionar nuestra tabla de usuarios + sesiones, y perdemos la integración limpia de `auth.uid()` con RLS de Supabase.
- **`@supabase/auth-helpers-nextjs`** (la lib vieja) — deprecated. No tiene sentido empezar nuevo proyecto con ella.
- **Endpoints REST en `/api/auth/*`** (en vez de Server Actions) — más boilerplate sin beneficio. Server Actions integran mejor con forms progresivos y validación server-side.
- **Magic links primarios** — UX agradable pero un único método deja al usuario sin fallback si su email proveedor es lento. Email+password es predecible.
