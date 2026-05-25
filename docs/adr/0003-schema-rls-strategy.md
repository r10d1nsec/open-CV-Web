# ADR-0003: Schema & RLS strategy — Postgres + Supabase RLS

- **Status**: accepted
- **Date**: 2026-05-22
- **Deciders**: r10d1n (founder)
- **Related specs**: spec:002 (profile), y todas las specs futuras que añadan tablas
- **Related ADRs**: ADR-0001 (stack base), ADR-0002 (auth)

## Context

Sub-sprint 3b introduce el primer schema real del producto. ADR-0001 ratificó Postgres vía Supabase con RLS, pero no fijó:

1. **Convención de migraciones**: dónde viven, cómo se numeran, cómo se aplican.
2. **Modelo de tenancy**: cómo se ata un perfil a un `auth.users`.
3. **Patrón canónico de RLS** para tablas con dueño y subtablas con dueño transitivo.
4. **Cómo se separan datos públicos (perfil publicado) de privados (drafts, bookings recibidos)**.
5. **Cómo se mantienen tipos TypeScript sincronizados con el schema**.

Master.md §6 propone un domain model. Esta ADR formaliza la traducción a Postgres + Supabase.

## Decision

### 1. Migraciones en `supabase/migrations/`

- Path: `supabase/migrations/NNNN_<slug>.sql`.
- Numeración timestamp `YYYYMMDDHHMMSS_<slug>.sql` (formato Supabase CLI estándar) **a partir de la migración 0004**.
- Para las 3 primeras (creación de tablas, RLS, triggers) usamos numeración corta `0001_initial.sql`, `0002_rls_policies.sql`, `0003_triggers.sql` por legibilidad — son commits del bootstrap. A partir de cambios incrementales se usa timestamp.
- Cada migración es **idempotente cuando es razonable** (`CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`) excepto cuando el cambio es destructivo (DROP, ALTER COLUMN incompatible).
- Aplicación: `supabase db push` desde local (cuando el usuario provea creds) y/o `supabase migration up` en CI.
- **Nunca editar una migración aplicada**. Si necesitas cambiarla, crea una nueva migración que altere el estado.

### 2. Tenancy: `auth.users` ↔ `public.profiles`

- `auth.users` (gestionado por Supabase Auth) es la única tabla de usuarios. No duplicamos en `public.users`.
- `public.profiles.user_id` es FK `NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE`. Un user ↔ un profile.
- Toda tabla "dependiente del perfil" usa **`profile_id`** (no `user_id`) como FK. Razón: el join natural en queries es por `profile_id` (las páginas públicas resuelven por `username → profile_id`), no por `user_id`. Y mantiene un único hop en RLS policies de subtablas.
- Tabla `auth.users` NO se toca por queries de aplicación. Toda lectura de "el perfil del usuario actual" pasa por `profiles.user_id = auth.uid()`.

### 3. Patrón canónico de RLS

Tres roles relevantes en Supabase:

- `anon` — visitante anónimo (sin sesión).
- `authenticated` — con sesión válida.
- `service_role` — bypasses RLS, solo server-side con `SUPABASE_SERVICE_ROLE_KEY`.

Política por tabla:

**A) Tablas de perfil (`profiles`)**:

```sql
-- SELECT público si está publicado
CREATE POLICY profiles_public_read ON public.profiles
  FOR SELECT TO anon, authenticated
  USING (is_published = true);

-- SELECT propio (drafts incluidos)
CREATE POLICY profiles_self_read ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- INSERT/UPDATE/DELETE solo el dueño
CREATE POLICY profiles_self_write ON public.profiles
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

**B) Subtablas con `profile_id` FK (`social_links`, `skill_groups`, `experience_items`, `projects`, `services`, `testimonials`, `username_history`)**:

```sql
-- SELECT público si el perfil padre está publicado
CREATE POLICY <tabla>_public_read ON public.<tabla>
  FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = <tabla>.profile_id AND p.is_published = true
  ));

-- SELECT propio (drafts incluidos)
CREATE POLICY <tabla>_self_read ON public.<tabla>
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = <tabla>.profile_id AND p.user_id = auth.uid()
  ));

-- INSERT/UPDATE/DELETE solo el dueño
CREATE POLICY <tabla>_self_write ON public.<tabla>
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = <tabla>.profile_id AND p.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = <tabla>.profile_id AND p.user_id = auth.uid()
  ));
```

Para evitar repetición en futuras migraciones, podemos extraer estos patrones a una función helper SQL en migración posterior (`create_owner_policies(table_name text)`) — fuera de scope de Sprint 3b, anotado en backlog.

**C) Tablas no-públicas (a partir de Sprint 4: `portfolio_settings`, `cv`, `bookings`, `contact_messages`, `calendar_connections`, `analytics_events`)**:

- No tienen política `*_public_read`. Solo `*_self_read` y `*_self_write`.
- `bookings` y `contact_messages` necesitan política adicional para INSERT anónimo (visitante crea booking/mensaje) — se diseña en sus specs respectivas (007, futura 010).

### 4. RLS habilitado siempre

- `ALTER TABLE public.<tabla> ENABLE ROW LEVEL SECURITY;` en TODAS las tablas de `public`. Sin excepciones.
- `ALTER TABLE public.<tabla> FORCE ROW LEVEL SECURITY;` para que ni siquiera el owner del schema bypase (sí lo hace `service_role`).

### 5. Triggers comunes

- `set_updated_at()` BEFORE UPDATE en cualquier tabla con `updated_at`. Sprint 3b lo aplica a `profiles`. Futuras tablas con `updated_at` reutilizan la misma función.
- `handle_new_user()` AFTER INSERT en `auth.users` → INSERT en `public.profiles` con `username = 'user-' || substr(NEW.id::text, 1, 8)` provisional. Sprint 5 (onboarding) reemplaza ese username.

### 6. Tipos TypeScript

- Generados con `supabase gen types typescript --linked > lib/supabase/types.ts`.
- Ejecutado manualmente en Sprint 3b/3c. Automatización en CI queda para Sprint 11.
- El tipo `Profile` de `types/profile.ts` (consumido por la UI) **no se reemplaza** por los tipos generados — se mantiene como contrato de la capa de presentación. `lib/profile-store.ts` mapea de `Database['public']['Tables']['profiles']['Row']` (+ joins) → `Profile`.
- Razón: la UI no debe acoplarse al schema exacto de la DB. Si cambia un campo nullable o un nombre de columna, mapeamos en una sola capa y no propagamos.

### 7. Convención de naming

- Tablas: `snake_case`, plural (`profiles`, `social_links`, `experience_items`).
- Columnas: `snake_case`, singular (`user_id`, `created_at`, `is_published`).
- Booleans: prefijo `is_` o `has_` (`is_published`, `is_active`).
- Timestamps: `_at` sufijo (`created_at`, `updated_at`).
- FKs: `<entidad_singular>_id` (`profile_id`, `service_id`).
- Índices: `<tabla>_<columna(s)>_idx` (`profiles_username_idx`).
- Políticas RLS: `<tabla>_<acción>_<scope>` (`profiles_public_read`, `social_links_self_write`).

### 8. Extensiones requeridas

- `pgcrypto` (para `gen_random_uuid()`).
- `citext` (para `username` case-insensitive con UNIQUE).

Ambas se habilitan en `0001_initial.sql` con `CREATE EXTENSION IF NOT EXISTS`.

## Consequences

**Positivas**:

- RLS centralizada: la autorización vive en la DB, no se puede olvidar en una query. Service Role bypasea solo cuando lo necesitamos (seed, jobs admin).
- Patrón de políticas repetible y predecible — futuras specs siguen la plantilla A/B/C.
- Un único punto de mapeo (`lib/profile-store.ts`) entre schema y dominio. Cambios de schema no propagan a 20 componentes.
- `auth.users` como tabla canónica simplifica RLS y elimina sincronización custom.

**Negativas**:

- RLS añade overhead en queries con muchas subtablas (cada SELECT chequea EXISTS). Mitigación: índices en `profile_id` de cada subtabla, y `profiles_username_idx` para resolución rápida.
- Migrar a otro Postgres (no Supabase) requeriría reescribir RLS para usar otro mecanismo de identidad (no `auth.uid()`). Aceptado: ADR-0001 ya documenta el lock-in a Supabase.
- Schema de "string libre" en `period`, `price`, `hourly` aplaza el problema de tipado fuerte (rangos de fecha, moneda). Aceptado para MVP — los usuarios escriben texto que el portfolio renderiza. v1 lo estructura cuando metamos billing real.

**Riesgos a vigilar**:

- Si una futura tabla olvida `ENABLE ROW LEVEL SECURITY`, todo el mundo puede leerla. Mitigación: lint en CI que verifica que toda tabla en `public.*` tenga RLS habilitada (queda como tarea para Sprint 11).
- `handle_new_user()` crea filas en cascada — si falla, signup falla. Tests integration deben cubrir el happy path.
- Seed/dev: el service_role bypassea RLS. No usarlo nunca desde el cliente. Documentado en `lib/supabase/server.ts` y `lib/env.ts`.

## Alternatives considered

- **Sin RLS, autorización en la capa de aplicación** — más simple aparentemente, pero un descuido en una query expone datos. Industria-estándar para Supabase es RLS-first.
- **`public.users` duplicando `auth.users`** — sync entre dos tablas, source-of-truth confuso, riesgo de drift. La práctica recomendada por Supabase es FK directa a `auth.users` y NO duplicar.
- **Tabla denormalizada `profiles` con columnas JSONB** para skills/experience/projects — más simple en escritura pero peor en queries, indexing y validación. Preferimos normalización clásica.
- **Numeración por timestamp desde la migración 1** — más estándar Supabase CLI, pero las primeras 3 son del bootstrap y se leen mejor con `0001`/`0002`/`0003`. Acordado mantener corto para bootstrap y timestamp después.
- **Generar tipos directamente como `Profile` (sin capa de mapeo)** — acopla UI a schema. Rechazado en favor del mapping layer.
