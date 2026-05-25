import { SITE_DOMAIN } from '@/lib/site';
/**
 * Dashboard del alumno autenticado.
 *
 * - `requireUser('/dashboard')` ya redirige a /login si no hay sesión.
 * - `getCurrentProfile()` devuelve el perfil del usuario (o null si todavía no
 *   ha hecho onboarding — Sprint 5 añadirá el redirect al wizard).
 * - Cierra el T8 diferido de Sprint 3a con el botón Logout.
 *
 * Refs: spec:002 (profile), spec:008 (routing), Sprint 4 S4.5.
 */
import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Metadata, Route } from 'next';
import { requireUser } from '@/lib/auth';
import { getCurrentProfile } from '@/lib/profile-store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Pill } from '@/components/ui/pill';
import { LogoutButton } from '@/app/(dashboard)/_components/logout-button';

export const metadata: Metadata = {
  title: 'Tu Folio · Dashboard',
};

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  await requireUser('/dashboard');
  const profile = await getCurrentProfile();

  // Gate de onboarding (spec:011). Si el perfil no existe o está sin completar,
  // mandamos al wizard. Las rutas públicas no se ven afectadas.
  if (!profile || !profile.onboardedAt) {
    redirect('/onboarding');
  }

  return (
    <main
      style={{
        minHeight: '100dvh',
        padding: '32px 24px 64px',
        maxWidth: 920,
        marginInline: 'auto',
      }}
    >
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 32,
        }}
      >
        <div>
          <p
            className="mono"
            style={{
              fontSize: 10.5,
              color: 'var(--text-faint)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              margin: 0,
            }}
          >
            Tu cuenta
          </p>
          <h1 style={{ fontSize: 28, margin: '4px 0 0', letterSpacing: '-0.02em' }}>
            Hola, {profile.name.split(' ')[0]}
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link href={'/dashboard/booking' as Route} className="btn btn-ghost btn-sm" style={{ textDecoration: 'none' }}>
            Reservas
          </Link>
          <Link href={'/dashboard/leads' as Route} className="btn btn-ghost btn-sm" style={{ textDecoration: 'none' }}>
            Mensajes
          </Link>
          <Link href={'/dashboard/settings' as Route} className="btn btn-ghost btn-sm" style={{ textDecoration: 'none' }}>
            Ajustes
          </Link>
          <LogoutButton />
        </div>
      </header>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Card style={{ padding: 24, display: 'flex', justifyContent: 'space-between', gap: 24, alignItems: 'center' }}>
          <div>
            <Pill dot style={{ color: profile.available ? 'var(--success)' : 'var(--text-faint)', marginBottom: 10 }}>
              {profile.available ? 'Disponible' : 'No disponible'}
            </Pill>
            <h2 style={{ fontSize: 20, margin: '0 0 6px', letterSpacing: '-0.01em' }}>
              {profile.name}
            </h2>
            <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: 14 }}>{profile.title}</p>
            <p
              className="mono"
              style={{ margin: '10px 0 0', fontSize: 12, color: 'var(--text-faint)' }}
            >
              {SITE_DOMAIN}/{profile.username}
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Link href={`/${profile.username}` as Route} style={{ textDecoration: 'none' }}>
              <Button variant="primary" size="md">
                Ver portfolio público
              </Button>
            </Link>
            <Link href={'/dashboard/edit' as Route} style={{ textDecoration: 'none' }}>
              <Button variant="secondary" size="md">
                Editar perfil
              </Button>
            </Link>
          </div>
        </Card>

        <Card style={{ padding: 20 }}>
          <h3 style={{ margin: '0 0 8px', fontSize: 15, letterSpacing: '-0.01em' }}>
            Tu tarjeta digital
          </h3>
          <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: 13 }}>
            Comparte{' '}
            <code className="mono">{SITE_DOMAIN}/c/{profile.username}</code> o el QR
            imprimible.
          </p>
          <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
            <Link href={`/c/${profile.username}` as Route} style={{ textDecoration: 'none' }}>
              <Button variant="secondary" size="sm">
                Abrir mi card
              </Button>
            </Link>
            <a
              href={`/api/card/${profile.username}/qr?width=512`}
              download={`folio-qr-${profile.username}.png`}
              className="btn btn-ghost btn-sm"
              style={{ textDecoration: 'none' }}
            >
              Descargar QR
            </a>
          </div>
        </Card>
      </section>
    </main>
  );
}
