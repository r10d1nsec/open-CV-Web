import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { PortfolioNav } from '@/components/portfolio/portfolio-nav';
import { PortfolioHero } from '@/components/portfolio/portfolio-hero';
import { PortfolioSkills } from '@/components/portfolio/portfolio-skills';
import { PortfolioExperience } from '@/components/portfolio/portfolio-experience';
import { PortfolioProjects } from '@/components/portfolio/portfolio-projects';
import { PortfolioBookingTeaser } from '@/components/portfolio/portfolio-booking-teaser';
import { PortfolioContact } from '@/components/portfolio/portfolio-contact';
import { PortfolioFooter } from '@/components/portfolio/portfolio-footer';
import { getProfileByUsername } from '@/lib/profile-store';
import { isReservedSlug } from '@/lib/validation/reserved-slugs';
import { themeVars } from '@/lib/theme';
import type { SectionKey } from '@/types/profile';

type Params = { username: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { username } = await params;
  if (isReservedSlug(username)) return { title: 'Folio — perfil no encontrado' };
  const profile = await getProfileByUsername(username);
  if (!profile) return { title: 'Folio — perfil no encontrado' };
  return {
    title: `${profile.name} — ${profile.title}`,
    description: profile.bio,
  };
}

export default async function PortfolioPage({ params }: { params: Promise<Params> }) {
  const { username } = await params;
  if (isReservedSlug(username)) notFound();
  const profile = await getProfileByUsername(username);
  if (!profile) notFound();

  const hidden = new Set(profile.sectionHidden);
  const SECTIONS: Record<SectionKey, ReactNode> = {
    hero: <PortfolioHero key="hero" profile={profile} />,
    skills: <PortfolioSkills key="skills" profile={profile} />,
    experience: <PortfolioExperience key="experience" profile={profile} />,
    projects: <PortfolioProjects key="projects" profile={profile} />,
    // "services" reutiliza el teaser de booking en v1 (flujo real: Sprint 12-13).
    services: <PortfolioBookingTeaser key="services" profile={profile} />,
    contact: <PortfolioContact key="contact" profile={profile} />,
    testimonials: null,
  };

  // Hero y contact siempre presentes; el resto sigue el orden y la visibilidad
  // configurados por el alumno (spec:014).
  const ordered = profile.sectionOrder.filter((s) => !hidden.has(s) && SECTIONS[s]);

  return (
    <main style={themeVars(profile.accentColor, profile.fontFamily)}>
      <PortfolioNav profile={profile} />
      {ordered.map((s) => SECTIONS[s])}
      <PortfolioFooter profile={profile} />
    </main>
  );
}
