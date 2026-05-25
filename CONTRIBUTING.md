# Contributing · Contribuir

🇬🇧 Thanks for your interest! · 🇪🇸 ¡Gracias por tu interés!

## English
1. Fork & branch from `main`.
2. `pnpm install`, then keep the gate green:
   ```bash
   pnpm typecheck && pnpm lint && pnpm test
   PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1 pnpm test:e2e --project=chromium-desktop
   pnpm build
   ```
   (e2e that need a DB are auto-skipped when `NEXT_PUBLIC_SUPABASE_URL` is unset.)
3. Conventions: TypeScript (no `any` without reason), functional React components, files in `kebab-case`, components in `PascalCase`, App Router only. Use the CSS design tokens — don't hardcode colors. Validate at boundaries (zod).
4. Tests first for new server actions / pure libs. Open a PR with a clear description.

## Español
1. Forkea y crea rama desde `main`.
2. `pnpm install` y mantén el gate en verde:
   ```bash
   pnpm typecheck && pnpm lint && pnpm test
   PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1 pnpm test:e2e --project=chromium-desktop
   pnpm build
   ```
   (los e2e que requieren DB se saltan solos si no hay `NEXT_PUBLIC_SUPABASE_URL`.)
3. Convenciones: TypeScript (sin `any` injustificado), componentes React funcionales, archivos en `kebab-case`, componentes en `PascalCase`, solo App Router. Usa los design tokens CSS — no hardcodees colores. Valida en los límites (zod).
4. Tests primero para nuevas server actions / libs puras. Abre un PR con descripción clara.
