import { SITE_DOMAIN } from '@/lib/site';
/**
 * Ajustes de cuenta — Sprint 9 (spec:015).
 *
 * Muestra la info de la cuenta y la "zona de peligro" con el borrado RGPD.
 * Gate de auth + onboarding como el resto del dashboard.
 */
import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Metadata, Route } from 'next';
import { requireUser } from '@/lib/auth';
import { getCurrentProfile } from '@/lib/profile-store';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { DeleteAccountForm } from '@/app/(dashboard)/dashboard/settings/_components/delete-account-form';

export const metadata: Metadata = { title: 'Ajustes · Folio' };
export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  await requireUser('/dashboard/settings');
  const profile = await getCurrentProfile();
  if (!profile || !profile.onboardedAt) redirect('/onboarding');

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main style={{ minHeight: '100dvh', padding: '32px 24px 64px', maxWidth: 720, marginInline: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <p className="mono" style={{ fontSize: 10.5, color: 'var(--text-faint)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
            Ajustes
          </p>
          <h1 style={{ fontSize: 28, margin: '4px 0 0', letterSpacing: '-0.02em' }}>Tu cuenta</h1>
        </div>
        <Link href={'/dashboard' as Route} style={{ fontSize: 13, color: 'var(--text-dim)', textDecoration: 'none' }}>
          ← Volver al dashboard
        </Link>
      </header>

      <Card style={{ padding: 24 }}>
        <h2 style={{ margin: '0 0 4px', fontSize: 16 }}>Cuenta</h2>
        <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: 13 }}>
          Sesión iniciada como <strong>{user?.email}</strong>.
        </p>
        <p className="mono" style={{ margin: '10px 0 0', fontSize: 12, color: 'var(--text-faint)' }}>
          {SITE_DOMAIN}/{profile.username}
        </p>
      </Card>

      <Card
        style={{
          padding: 24,
          borderColor: 'rgba(239,68,68,0.35)',
          background: 'color-mix(in oklab, var(--danger) 4%, var(--surface))',
        }}
      >
        <h2 style={{ margin: '0 0 4px', fontSize: 16, color: 'var(--danger)' }}>Zona de peligro</h2>
        <p style={{ margin: '0 0 16px', color: 'var(--text-dim)', fontSize: 13 }}>
          Borrar tu cuenta elimina todos tus datos de forma permanente (RGPD).
        </p>
        <DeleteAccountForm username={profile.username} />
      </Card>
    </main>
  );
}
