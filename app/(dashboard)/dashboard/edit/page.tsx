/**
 * Editor de perfil — Sprint 4 S4.6.
 *
 * Server Component que carga el perfil del user actual y monta 4 secciones
 * Client Component (Identity, Bio, Social, Skills). Cada una tiene su propia
 * Server Action; guardar es independiente por sección.
 *
 * Experience y Projects quedan como placeholder hasta el sub-sprint extra
 * (drag-and-drop CRUD merece su propio diseño).
 *
 * Refs: spec:002 §Implementation, Sprint 4 S4.6.
 */
import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Metadata, Route } from 'next';
import { requireUser } from '@/lib/auth';
import { getCurrentProfile } from '@/lib/profile-store';
import {
  bioFromProfile,
  identityFromProfile,
  skillsFromProfile,
  socialFromProfile,
  experienceFromProfile,
  projectsFromProfile,
  testimonialsFromProfile,
  servicesFromProfile,
  brandFromProfile,
  cardFromProfile,
  cardLinksFromProfile,
} from '@/lib/validation/profile';
import { IdentitySection } from '@/app/(dashboard)/dashboard/edit/_sections/identity-section';
import { BioSection } from '@/app/(dashboard)/dashboard/edit/_sections/bio-section';
import { SocialSection } from '@/app/(dashboard)/dashboard/edit/_sections/social-section';
import { SkillsSection } from '@/app/(dashboard)/dashboard/edit/_sections/skills-section';
import { AvatarSection } from '@/app/(dashboard)/dashboard/edit/_sections/avatar-section';
import { ExperienceSection } from '@/app/(dashboard)/dashboard/edit/_sections/experience-section';
import { ProjectsSection } from '@/app/(dashboard)/dashboard/edit/_sections/projects-section';
import { TestimonialsSection } from '@/app/(dashboard)/dashboard/edit/_sections/testimonials-section';
import { ServicesSection } from '@/app/(dashboard)/dashboard/edit/_sections/services-section';
import { BrandSection } from '@/app/(dashboard)/dashboard/edit/_sections/brand-section';
import { CardSection } from '@/app/(dashboard)/dashboard/edit/_sections/card-section';

export const metadata: Metadata = {
  title: 'Editar perfil · Folio',
};

export const dynamic = 'force-dynamic';

export default async function EditProfilePage() {
  await requireUser('/dashboard/edit');
  const profile = await getCurrentProfile();
  if (!profile || !profile.onboardedAt) {
    // Sprint 5: si el wizard no está cerrado, el editor también gates.
    redirect('/onboarding');
  }

  return (
    <main
      style={{
        minHeight: '100dvh',
        padding: '32px 24px 64px',
        maxWidth: 920,
        marginInline: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}
    >
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
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
            Editar perfil
          </p>
          <h1 style={{ fontSize: 28, margin: '4px 0 0', letterSpacing: '-0.02em' }}>
            Personaliza tu CV moderno
          </h1>
        </div>
        <Link
          href={'/dashboard' as Route}
          style={{ fontSize: 13, color: 'var(--text-dim)', textDecoration: 'none' }}
        >
          ← Volver al dashboard
        </Link>
      </header>

      <AvatarSection initial={profile.avatarUrl ?? null} />
      <IdentitySection initial={identityFromProfile(profile)} />
      <BioSection initial={bioFromProfile(profile).bio} />
      <SocialSection initial={socialFromProfile(profile)} />
      <SkillsSection initial={skillsFromProfile(profile)} />
      <ExperienceSection initial={experienceFromProfile(profile)} />
      <ProjectsSection initial={projectsFromProfile(profile)} />
      <TestimonialsSection initial={testimonialsFromProfile(profile)} />
      <ServicesSection initial={servicesFromProfile(profile)} />
      <BrandSection initial={brandFromProfile(profile)} />
      <CardSection card={cardFromProfile(profile)} links={cardLinksFromProfile(profile)} />
    </main>
  );
}
