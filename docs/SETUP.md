# Setup · Configuración

🇬🇧 [English](#english) · 🇪🇸 [Español](#español)

---

## English

### 1. Prerequisites
- Node 22, pnpm 10. (`corepack enable` gives you pnpm.)
- A free [Supabase](https://supabase.com) project (for auth + database).

### 2. Install
```bash
pnpm install
cp .env.example .env.local
```

### 3. Supabase
1. Create a project → **Settings → API**. Copy:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` → into `.env.local`.
2. Set `NEXT_PUBLIC_SITE_URL` to your URL (`http://localhost:3000` in dev).
3. Apply the schema (migrations in `supabase/migrations/`):
   ```bash
   pnpm dlx supabase login
   pnpm dlx supabase link --project-ref <your-project-ref>
   pnpm dlx supabase db push        # applies all migrations + RLS
   ```
4. (Optional) Seed the example profile:
   ```bash
   pnpm dlx supabase db query --linked -f supabase/seed.sql
   ```
   Replace `supabase/seed.sql` with your own data, or just sign up and fill your profile from the dashboard.

### 4. Run
```bash
pnpm dev      # http://localhost:3000  → sign up at /signup
```

### Optional integrations
- **Email (Resend)**: set `RESEND_API_KEY` + `EMAIL_FROM` (a verified domain). Without it, contact/booking messages are stored in DB but not emailed.
- **Google OAuth**: configure an OAuth client (Google Cloud Console) + enable Google in Supabase Auth, then set `NEXT_PUBLIC_ENABLE_GOOGLE_OAUTH=true`. See `docs/adr/0005-google-oauth.md`.
- **Upstash Redis** (`UPSTASH_REDIS_REST_URL/TOKEN`): multi-instance rate limiting. Falls back to in-memory.
- **Sentry** (`NEXT_PUBLIC_SENTRY_DSN`): error tracking (production only).

### Zero-config demo
Without Supabase env, the app serves a built-in mock profile at `/maya` and `/c/maya`. Great for a quick look; auth/dashboard need Supabase.

---

## Español

### 1. Requisitos
- Node 22, pnpm 10 (`corepack enable`).
- Un proyecto gratuito de [Supabase](https://supabase.com) (auth + base de datos).

### 2. Instalar
```bash
pnpm install
cp .env.example .env.local
```

### 3. Supabase
1. Crea un proyecto → **Settings → API**. Copia a `.env.local`:
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
2. Pon `NEXT_PUBLIC_SITE_URL` a tu URL (`http://localhost:3000` en local).
3. Aplica el esquema (migraciones en `supabase/migrations/`):
   ```bash
   pnpm dlx supabase login
   pnpm dlx supabase link --project-ref <tu-project-ref>
   pnpm dlx supabase db push        # aplica migraciones + RLS
   ```
4. (Opcional) Seed del perfil de ejemplo:
   ```bash
   pnpm dlx supabase db query --linked -f supabase/seed.sql
   ```
   Sustitúyelo por tus datos, o simplemente regístrate y rellena tu perfil desde el dashboard.

### 4. Arrancar
```bash
pnpm dev      # http://localhost:3000  → regístrate en /signup
```

### Integraciones opcionales
- **Email (Resend)**: `RESEND_API_KEY` + `EMAIL_FROM` (dominio verificado). Sin esto, los mensajes se guardan en DB pero no se envían.
- **Google OAuth**: OAuth client en Google Cloud Console + habilitar Google en Supabase Auth + `NEXT_PUBLIC_ENABLE_GOOGLE_OAUTH=true`. Ver `docs/adr/0005-google-oauth.md`.
- **Upstash Redis**: rate limiting multi-instancia. Si no, usa memoria.
- **Sentry**: captura de errores (solo producción).

### Demo sin configuración
Sin env de Supabase, la app sirve un perfil mock en `/maya` y `/c/maya`. El auth/dashboard requieren Supabase.
