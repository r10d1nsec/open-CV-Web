import { SITE_DOMAIN } from '@/lib/site';
/**
 * Contact form público — Sprint 6 S6.4.
 *
 * Reemplaza el placeholder del Sprint 4. Renderiza un form que envía
 * mensaje al alumno vía Resend (graceful si no está configurado) y guarda
 * en `contact_messages`.
 *
 * Refs: spec:012, spec:008.
 */
import { notFound } from 'next/navigation';
import type { Metadata, Route } from 'next';
import Link from 'next/link';
import { getProfileByUsername } from '@/lib/profile-store';
import { isReservedSlug } from '@/lib/validation/reserved-slugs';
import { ContactForm } from '@/app/(public)/[username]/contact/_components/contact-form';

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
    title: `Contactar con ${profile.name}`,
    description: `Envía un mensaje a ${profile.name}.`,
  };
}

export default async function ContactPage({ params }: { params: Promise<Params> }) {
  const { username } = await params;
  if (isReservedSlug(username)) notFound();
  const profile = await getProfileByUsername(username);
  if (!profile) notFound();

  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
      }}
    >
      <div style={{ maxWidth: 520, width: '100%' }}>
        <header style={{ textAlign: 'center', marginBottom: 24 }}>
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
            {SITE_DOMAIN}/{profile.username}/contact
          </p>
          <h1 style={{ fontSize: 26, margin: '6px 0 8px', letterSpacing: '-0.02em' }}>
            Contactar con {profile.name}
          </h1>
          <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: 14 }}>
            Te responderá al email que indiques. Sin spam.
          </p>
        </header>

        <ContactForm username={profile.username} displayName={profile.name} />

        <p style={{ marginTop: 24, textAlign: 'center', fontSize: 13 }}>
          <Link
            href={`/${profile.username}` as Route}
            style={{ color: 'var(--text-dim)', textDecoration: 'none' }}
          >
            ← Volver al portfolio
          </Link>
        </p>
      </div>
    </main>
  );
}
