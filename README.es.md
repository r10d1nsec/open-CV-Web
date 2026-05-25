# Folio — portfolio + tarjeta digital open-source

[🇬🇧 English](./README.md) · 🇪🇸 Español

Tu presencia profesional en una sola URL: un **portfolio público** cuidado, una **tarjeta digital mobile-first** animada (QR + vCard + WhatsApp), **reservas autogestionadas** y un **formulario de contacto** protegido — autohospedable y totalmente personalizable.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/r10d1nsec/open-CV-Web&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY,NEXT_PUBLIC_SITE_URL&envDescription=Claves%20de%20Supabase%20y%20la%20URL%20publica%20de%20tu%20sitio)

## Capturas

![Portfolio público](./docs/screenshots/portfolio.jpg)

<table>
  <tr>
    <td width="62%"><img src="./docs/screenshots/landing.jpg" alt="Landing" /></td>
    <td width="38%"><img src="./docs/screenshots/card.jpg" alt="Tarjeta digital móvil" /></td>
  </tr>
  <tr>
    <td align="center"><sub>Landing</sub></td>
    <td align="center"><sub>Tarjeta digital (móvil)</sub></td>
  </tr>
</table>

## Funcionalidades

- **Portfolio público** `/<usuario>` — hero, skills, experiencia, proyectos (con imágenes + enlaces), servicios, testimonios, contacto. Personalización por perfil (color de acento, fuente, orden y visibilidad de secciones).
- **Tarjeta digital** `/c/<usuario>` — mobile-first, animada (CSS puro), 3 estilos (aurora/minimal/mesh). Guardar contacto (vCard), **WhatsApp**, llamar/SMS/email, **enlaces personalizados ilimitados**, redes, **QR + compartir nativo**, captación de leads. Todo editable desde el dashboard.
- **Reservas autogestionadas** — disponibilidad semanal + reservas con aprobación del dueño (zona Europe/Madrid por defecto). Sin calendario externo ni OAuth.
- **Dashboard** — wizard de onboarding, editor completo (identidad, bio, social, skills, proyectos, testimonios, servicios, marca, tarjeta), bandeja de leads, borrado de cuenta (RGPD).
- **Auth** — email/contraseña (Supabase). Google OAuth listo tras un feature flag.
- **Extras** — endpoints vCard + QR, rate limiting (memoria o Upstash), email opcional (Resend), Sentry opcional.

## Stack

Next.js 15 (App Router, TS strict) · React 19 · Supabase (Auth/Postgres/Storage, RLS) · Tailwind + design tokens CSS · Vitest + Playwright · despliegue en Vercel o cualquier host Node 22.

## Inicio rápido (local)

```bash
git clone https://github.com/r10d1nsec/open-CV-Web.git
cd open-CV-Web
pnpm install
pnpm dev                        # http://localhost:3000
```

Sin Supabase configurado verás el perfil demo integrado (mock) en `/maya` y `/c/maya` — cero configuración. Para hacerlo real (auth + tus datos), conecta Supabase: ver **[docs/SETUP.md](./docs/SETUP.md)**.

## Desplegar

- **Vercel (recomendado)**: pulsa el botón de arriba, rellena las variables, listo. Guía completa: **[docs/DEPLOY.md](./docs/DEPLOY.md)**.
- **Self-host**: `pnpm build && pnpm start` en Node 22. Ver DEPLOY.

## Personalizar

Tema, acento, fuentes, layouts, secciones, la tarjeta y sus enlaces — desde el dashboard o vía design tokens. Ver **[docs/CUSTOMIZE.md](./docs/CUSTOMIZE.md)**.

## Licencia

MIT © 2026 Ángel Roldán Ruiz. Ver [LICENSE](./LICENSE). Se aceptan contribuciones — ver [CONTRIBUTING.md](./CONTRIBUTING.md).
