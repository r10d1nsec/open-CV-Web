# Customize · Personalizar

🇬🇧 [English](#english) · 🇪🇸 [Español](#español)

---

## English

### From the dashboard (no code)
Sign in → **/dashboard/edit**:
- **Identity / Bio / Social / Skills / Projects / Testimonials / Services** — your content. Projects support an image URL + accent color + repo/live links.
- **Brand** — accent color (8 presets + custom hex), font (Plus Jakarta / Inter / Tiempos), layout, and show/hide + reorder sections.
- **Your card** — style (aurora/minimal/mesh), company, **WhatsApp** number + prefilled message, and **custom links** (icon + label + URL).
- **Booking** — weekly availability + approve/reject requests. **Leads** — contact messages. **Settings** — GDPR account deletion.

### Design tokens (code)
All colors/spacing/typography live as CSS variables in `styles/design-system.css` (dark + light). The per-profile accent/font are injected at runtime by `lib/site.ts` is for infra; theming is in `lib/theme.ts` (`themeVars`). Change the global palette by editing the tokens; **don't** hardcode new colors — use the vars.

### Add a section / route
New top-level routes must be added to `lib/validation/reserved-slugs.ts` (so a username can't collide). Portfolio sections render from `app/(public)/[username]/page.tsx` driven by `section_order`/`section_hidden`.

### i18n
Strings are currently ES with some EN. To add locales, extract strings and add a dictionary; the public URLs don't need to change.

---

## Español

### Desde el dashboard (sin código)
Inicia sesión → **/dashboard/edit**:
- **Identidad / Bio / Social / Skills / Proyectos / Testimonios / Servicios** — tu contenido. Los proyectos admiten URL de imagen + color de acento + enlaces a repo/demo.
- **Marca** — color de acento (8 presets + hex), fuente (Plus Jakarta / Inter / Tiempos), layout y mostrar/ocultar + reordenar secciones.
- **Tu tarjeta** — estilo (aurora/minimal/mesh), empresa, número de **WhatsApp** + mensaje pre-relleno, y **enlaces personalizados** (icono + texto + URL).
- **Reservas** — disponibilidad semanal + aprobar/rechazar. **Mensajes** — leads. **Ajustes** — borrado RGPD.

### Design tokens (código)
Colores/espaciado/tipografía son CSS variables en `styles/design-system.css` (dark + light). El acento/fuente por perfil se inyectan en runtime vía `lib/theme.ts` (`themeVars`). Cambia la paleta global editando los tokens; **no** hardcodees colores nuevos: usa las vars.

### Añadir sección / ruta
Las rutas top-level nuevas deben añadirse a `lib/validation/reserved-slugs.ts` (para que un username no colisione). Las secciones del portfolio se renderizan desde `app/(public)/[username]/page.tsx` según `section_order`/`section_hidden`.

### i18n
Hoy los textos son ES con algo de EN. Para añadir idiomas, extrae los textos y añade un diccionario; las URLs públicas no cambian.
