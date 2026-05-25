# ADR-0006 — Theming por perfil vía CSS vars inline

> Estado: aceptado (Sprint 8). Refs: spec:014.

## Contexto

Cada alumno personaliza color de acento y tipografía de su portfolio público. El design system (`styles/design-system.css`) define los tokens como CSS custom properties y es el contrato del proyecto (no se modifica sin actualizar el origen).

## Decisión

Inyectar la personalización como **CSS custom properties inline** en el `<main>` del portfolio público (`themeVars()` en `lib/theme.ts`), sobreescribiendo `--accent*` y `--font-sans` solo para ese subtree. La fuente se fija también como `fontFamily` explícito en el wrapper (cambiar solo la var no re-aplica la font-family ya heredada del body).

## Alternativas descartadas

- **Reescribir design-system.css por usuario**: rompe el contrato y no es per-request.
- **`<style>` con selector por id**: más frágil y verboso que el style inline en el contenedor.
- **Clases Tailwind dinámicas**: el proyecto usa CSS vars, no utilidades de color arbitrarias.

## Consecuencias

- Accent + font escalables por perfil sin tocar el design system.
- El acento deriva hover/rgb/soft/glow desde el hex (un solo input).
- Layout variants se modelan como dato (`layout_variant`) pero su render alterno (sidebar/minimal) queda como follow-up.
