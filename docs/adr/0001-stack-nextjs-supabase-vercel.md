# ADR-0001: Stack base — Next.js + Supabase + Vercel

- **Status**: accepted
- **Date**: 2026-05-21
- **Deciders**: r10d1n (founder)
- **Related specs**: pendiente (toda spec MVP referenciará este ADR)

## Context

Necesitamos un stack que permita: (1) iteración rápida de un solo desarrollador, (2) coste bajo en tiers iniciales, (3) buen soporte de SSR/ISR para páginas públicas (`/u/:username`, `/card/:username`) optimizadas para SEO y mobile, (4) auth + DB + storage sin construir backend propio, (5) integración nativa con Google Calendar y email transaccional, (6) deploy con preview branches y rollback.

`master.md` §4 ya describe la dirección preferida; este ADR la formaliza.

## Decision

Adoptamos como stack base:

- **Frontend / Backend**: **Next.js 16+ con App Router** y **TypeScript**. Server Components por defecto, Server Actions para mutaciones, Route Handlers (`/app/api/*`) para webhooks y endpoints públicos.
- **Estilos**: **Tailwind CSS** (utility-first). Componentes vía **shadcn/ui** cuando aporte.
- **BaaS**: **Supabase** para Auth (email/password + Google OAuth), Postgres (con RLS), y Storage (CVs y avatares).
- **Hosting**: **Vercel** con **Fluid Compute** por defecto (no Edge Functions). Node.js 24 LTS.
- **Email transaccional**: **Resend** (por consistencia con stack ya usado en el entorno; alternativa Postmark si caemos en límites).
- **Calendar**: **Google Calendar** vía OAuth + API oficial. Outlook queda para v1+.
- **QR**: librería server-side (`qrcode` u equivalente) en route handler; QR cacheado en Supabase Storage.
- **Analytics propios**: tabla `AnalyticsEvent` en Postgres + endpoint con rate limit. Sin tracker de terceros en MVP.

## Consequences

**Positivas**:

- Stack single-vendor en frontend/hosting (Vercel) y BaaS (Supabase) → menos integración manual, env vars auto-provisionadas vía Marketplace.
- Auth, DB, storage y migraciones gestionadas por Supabase → más velocidad de feature.
- Fluid Compute permite Node.js completo en middleware/funciones → sin las restricciones de Edge Runtime.
- ISR + Server Components dan rendimiento excelente en páginas públicas con SEO.
- Free/low-cost tiers cubren el MVP.

**Negativas**:

- Acoplamiento a Supabase: migrar a otro Postgres requeriría reescribir RLS y reemplazar Supabase Auth.
- Acoplamiento a Vercel para features avanzadas (ISR, middleware, Fluid Compute). Salir significa perder estas optimizaciones.
- Limitaciones en cuotas de free tier (storage, bandwidth, MAUs de auth) — vigilar al escalar.

**Riesgos a vigilar**:

- Costes si crece tráfico en `/u/:username` (mitigar con ISR agresivo).
- Tokens de Google Calendar deben cifrarse en reposo (no almacenarlos en texto plano en `CalendarConnection`).
- Cumplimiento RGPD: borrado de cuenta debe cascadear en todas las tablas + Storage + revocar tokens OAuth.

## Alternatives considered

- **Remix + PlanetScale + Fly.io** — más control, pero más integración manual y peor DX de previews que Vercel.
- **SvelteKit + Supabase + Vercel** — menor ecosistema de componentes (shadcn, etc.) y menos familiar para el equipo actual.
- **Firebase** en lugar de Supabase — peor fit para schema relacional (User/Profile/Booking) y sin Postgres/RLS nativo.
- **Cal.com self-hosted** como base del booking — sobre-engineering para MVP; reimplementamos lo mínimo y dejamos hook para integración futura.
- **next-forge monorepo** — útil para escala, pero overhead innecesario para single-dev MVP. Re-evaluar al entrar a v1 multi-tenant.
