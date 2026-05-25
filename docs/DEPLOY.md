# Deploy · Despliegue

🇬🇧 [English](#english) · 🇪🇸 [Español](#español)

---

## English

### Vercel (recommended)
1. Click **Deploy with Vercel** in the README (or import the repo at vercel.com/new).
2. Set environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` → your production URL (e.g. `https://your-domain.com`)
   - Optional: `RESEND_API_KEY`, `EMAIL_FROM`, `NEXT_PUBLIC_ENABLE_GOOGLE_OAUTH`, `UPSTASH_REDIS_REST_URL/TOKEN`, `NEXT_PUBLIC_SENTRY_DSN`
3. Deploy. Apply DB migrations once with `supabase db push` (see SETUP).
4. Add your domain in Vercel → Settings → Domains, and update Supabase Auth → URL Configuration (Site URL + redirect URLs) to your domain.

### Self-host (Node 22)
```bash
pnpm install
pnpm build
pnpm start          # serves on :3000 (set PORT to change)
```
Put it behind a reverse proxy (Nginx/Caddy) with TLS. Set all env vars in the process environment. Supabase is still the database/auth (cloud or self-hosted Supabase).

### Notes
- `NEXT_PUBLIC_SITE_URL` must be correct in production (used for QR, card and email URLs).
- Rate limiting uses in-memory by default (fine single-instance). For multiple instances, set Upstash.

---

## Español

### Vercel (recomendado)
1. Pulsa **Deploy with Vercel** en el README (o importa el repo en vercel.com/new).
2. Variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` → tu URL de producción (`https://tu-dominio.com`)
   - Opcionales: `RESEND_API_KEY`, `EMAIL_FROM`, `NEXT_PUBLIC_ENABLE_GOOGLE_OAUTH`, `UPSTASH_REDIS_REST_URL/TOKEN`, `NEXT_PUBLIC_SENTRY_DSN`
3. Despliega. Aplica las migraciones una vez con `supabase db push` (ver SETUP).
4. Añade tu dominio en Vercel → Settings → Domains, y actualiza Supabase Auth → URL Configuration (Site URL + redirect URLs) a tu dominio.

### Self-host (Node 22)
```bash
pnpm install
pnpm build
pnpm start          # sirve en :3000 (cambia con PORT)
```
Detrás de un reverse proxy (Nginx/Caddy) con TLS. Define las env vars en el entorno. Supabase sigue siendo la base de datos/auth (cloud o self-hosted).

### Notas
- `NEXT_PUBLIC_SITE_URL` debe ser correcto en producción (se usa para QR, tarjeta y emails).
- El rate limiting usa memoria por defecto (vale single-instance). Para varias instancias, configura Upstash.
