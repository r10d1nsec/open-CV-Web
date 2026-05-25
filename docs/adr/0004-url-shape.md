# ADR-0004: URL shape — rutas top-level por username

- **Status**: accepted
- **Date**: 2026-05-24
- **Deciders**: r10d1n (founder)
- **Related specs**: spec:002 (profile), spec:003 (public portfolio), spec:005 (digital card), spec:008 (routing migration)
- **Supersedes**: ninguno (ADR-0001 mencionaba `/u/:username` y `/card/:username` como provisional)

## Context

El producto se desplegará como **`your-domain.com`** (tu dominio) y se compartirá con una clase de empleabilidad como herramienta gratuita para que cada alumno publique su "CV moderno". La URL pública que cada alumno comparte (en LinkedIn, en su CV PDF, escrita en una pizarra) tiene que ser:

1. **Corta** — la comparten verbalmente y la escriben.
2. **Memorable** — `your-domain.com/maria-garcia` se entiende solo.
3. **Profesional** — `…/u/maria-garcia` con prefijo técnico transmite "demo".

El MVP actual (Sprints 0-3c) usa `/u/[username]` para el portfolio y `/card/[username]` para la tarjeta digital. Necesitamos decidir si:

- (A) Mantener `/u/[username]` y `/card/[username]` por simplicidad.
- (B) Promover `[username]` a top-level y mover la card a `/c/[username]` (corto, consistente con `[username]`).
- (C) Adoptar wildcard subdomain tenant: `<username>.your-domain.com`.

## Decision

Adoptamos la opción **(B)**:

- **Portfolio público**: `your-domain.com/<username>` (ej. `your-domain.com/maria-garcia`).
- **Tarjeta digital**: `your-domain.com/c/<username>`.
- **Contact form** (sustituye al booking en el plan v1): `your-domain.com/<username>/contact`.
- **Endpoints**: `your-domain.com/api/card/<username>/{vcard,qr}` se mantienen.
- **Rutas reservadas top-level**: bloqueadas como username vía `lib/validation/reserved-slugs.ts` (ya creada en S4.2). Cualquier feature nueva que añada un top-level segment debe añadir su slug al registry.

## Consequences

**Positivas**:

- URL pública limpia y compartible — el alumno enseña su URL y se entiende a la primera.
- `/c/` para la card es corto, lo bastante distintivo y no choca con conceptos cotidianos.
- Sin sobrecoste de DNS/SSL wildcard ni middleware host-based rewrites que C habría exigido.
- La lista de reserved-slugs queda como contrato explícito y verificado por tests — añadir routes nuevos es disciplinado.

**Negativas / costes**:

- Migración: hay que mover `app/u/[username]/*` → `app/[username]/*` y `app/card/[username]/*` → `app/c/[username]/*`. Tests e2e actualizados.
- **QRs ya generados (Maya, demos internos)** apuntan a `/card/maya` y `/u/maya/booking`. Mitigación: middleware sirve **301 permanentes** durante 6 meses desde `/u/<slug>` → `/<slug>` y `/card/<slug>` → `/c/<slug>`. Ningún QR impreso queda roto.
- Routing por catch-all en root expone una superficie nueva donde **cualquier path top-level no reservado** se resuelve contra `getProfileByUsername`. Si no existe → `notFound()`. La lista de reserved-slugs es la primera línea de defensa; el segundo control es la validación del username en onboarding (regex + unique + reserved check).

**Por qué no (C) wildcard subdomain**:

- Requiere DNS wildcard `*.your-domain.com` propagado, certificado wildcard en Vercel, middleware reescribiendo por `host`, y reestructurar todo el routing por host. Coste estimado: +3-4 días.
- La ganancia visual es marginal frente al coste para un MVP educativo.
- Reabrible en v2 si demand real lo justifica (la migración B→C es más natural que A→C).

## Open questions

- En v1.1, ¿permitir que el alumno reserve **alias** además de `username` (ej. `maria-garcia` + `mariag`)? Probablemente no — añade complejidad de redirect.
- ¿Permitir paths multi-segmento por perfil (`/<username>/proyectos`, `/<username>/cv`)? No en v1; el portfolio es single-page.

## Changelog interno

- 2026-05-24 — creado y aceptado. Estado vinculante para Sprint 4.
