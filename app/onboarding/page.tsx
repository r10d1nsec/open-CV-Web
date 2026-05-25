/**
 * Onboarding wizard — Sprint 5.
 *
 * Server component que detecta el step actual del perfil del user
 * autenticado y renderiza el client component correspondiente.
 *
 * - Si no hay sesión → `requireUser` redirige a /login.
 * - Si `onboarded_at` no es null → wizard cerrado, redirige a /dashboard.
 * - Si no, calcula el step:
 *     1. username provisional (empieza con `user-`) → StepUsername
 *     2. full_name vacío → StepIdentity
 *     3. title vacío → StepHeadline
 *     4. bio vacío → StepBio
 *     5. (resto) → StepAvatar (opcional + botón Completar)
 *
 * Cada step commit-ea a DB y revalida `/onboarding`, lo que dispara un
 * re-render del server component y el flow avanza al siguiente step
 * automáticamente.
 *
 * Refs: spec:011, Sprint 5 S5.4.
 */
import type { Metadata, Route } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Stepper, type StepIndex } from '@/app/onboarding/_components/stepper';
import { StepUsername } from '@/app/onboarding/_steps/step-username';
import { StepIdentity } from '@/app/onboarding/_steps/step-identity';
import { StepHeadline } from '@/app/onboarding/_steps/step-headline';
import { StepBio } from '@/app/onboarding/_steps/step-bio';
import { StepAvatar } from '@/app/onboarding/_steps/step-avatar';

export const metadata: Metadata = {
  title: 'Configura tu Folio · Onboarding',
};

export const dynamic = 'force-dynamic';

type ProfileRow = {
  username: string;
  full_name: string;
  title: string;
  bio: string;
  avatar_url: string | null;
  onboarded_at: string | null;
};

function computeStep(p: ProfileRow): StepIndex {
  if (p.username.startsWith('user-')) return 1;
  if (!p.full_name.trim()) return 2;
  if (!p.title.trim()) return 3;
  if (!p.bio.trim()) return 4;
  return 5;
}

export default async function OnboardingPage() {
  const user = await requireUser('/onboarding');
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, full_name, title, bio, avatar_url, onboarded_at')
    .eq('user_id', user.id)
    .maybeSingle<ProfileRow>();

  if (!profile) {
    return (
      <main style={{ padding: 48, maxWidth: 640, marginInline: 'auto' }}>
        <p style={{ color: 'var(--text-dim)' }}>
          Tu perfil aún se está creando. Espera unos segundos y refresca la página.
        </p>
      </main>
    );
  }

  if (profile.onboarded_at) {
    redirect('/dashboard?welcome=1' as Route);
  }

  const step = computeStep(profile);

  return (
    <main
      style={{
        minHeight: '100dvh',
        padding: '40px 24px 64px',
        maxWidth: 640,
        marginInline: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      <header>
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
          Configura tu Folio
        </p>
        <h1 style={{ fontSize: 24, margin: '4px 0 0', letterSpacing: '-0.02em' }}>
          5 pasos para publicar tu CV moderno
        </h1>
      </header>

      <Stepper current={step} />

      {step === 1 && <StepUsername initial={profile.username} />}
      {step === 2 && <StepIdentity initial={profile.full_name} />}
      {step === 3 && <StepHeadline initial={profile.title} />}
      {step === 4 && <StepBio initial={profile.bio} />}
      {step === 5 && <StepAvatar initial={profile.avatar_url} />}

      <footer style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-faint)' }}>
        <Link href={'/' as Route} style={{ color: 'inherit' }}>
          ← Cerrar sesión y salir
        </Link>
      </footer>
    </main>
  );
}
