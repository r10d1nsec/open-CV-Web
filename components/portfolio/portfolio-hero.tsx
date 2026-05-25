import Link from 'next/link';
import type { Route } from 'next';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Icon, type IconName } from '@/components/ui/icon';
import type { Profile } from '@/types/profile';

export function PortfolioHero({ profile }: { profile: Profile }) {
  const stats: Array<{ label: string; value: string; icon: IconName }> = [
    { label: 'Ubicación', value: profile.location, icon: 'pin' },
    ...(profile.hourly ? [{ label: 'Tarifa', value: profile.hourly, icon: 'sparkle' as const }] : []),
    {
      label: 'Idiomas',
      value: profile.languages.map((l) => l.split(' ')[0]?.slice(0, 2).toUpperCase()).join(' · '),
      icon: 'globe',
    },
  ];

  return (
    <section className="portfolio-hero" style={{ padding: '88px 56px 64px', position: 'relative' }}>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          background: 'radial-gradient(60% 60% at 80% 0%, var(--accent-soft), transparent 60%)',
        }}
      />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1080, marginInline: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
          <Avatar size={56} initials={profile.initials} src={profile.avatarUrl} hue={220} ring />
          <div>
            <div
              className="mono"
              style={{ fontSize: 11.5, color: 'var(--text-faint)', letterSpacing: '0.05em', textTransform: 'uppercase' }}
            >
              {profile.name} · {profile.location}
            </div>
            {profile.available && profile.availableLine && (
              <div style={{ fontSize: 13.5, color: 'var(--text-dim)', marginTop: 4 }}>
                <span className="dot dot-green" style={{ marginRight: 6 }} />
                {profile.availableLine}
              </div>
            )}
          </div>
        </div>

        <h1
          style={{
            fontSize: 64,
            lineHeight: 1.02,
            fontWeight: 600,
            maxWidth: 920,
            marginBottom: 22,
          }}
          className="portfolio-hero-h1"
        >
          <span
            style={{
              background: 'linear-gradient(90deg, var(--accent), #6366f1 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {profile.title}
          </span>
        </h1>
        <p
          style={{
            fontSize: 18,
            color: 'var(--text-dim)',
            maxWidth: 720,
            marginBottom: 36,
            lineHeight: 1.55,
          }}
        >
          {profile.bio}
        </p>

        <div style={{ display: 'flex', gap: 10, marginBottom: 40, flexWrap: 'wrap' }}>
          <Link href={`/${profile.username}/contact` as Route} style={{ textDecoration: 'none' }}>
            <Button size="lg" variant="primary">
              <Icon name="mail" size={16} /> Contactar
            </Button>
          </Link>
          {profile.cvUrl && (
            <a href={profile.cvUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <Button size="lg" variant="secondary">
                <Icon name="download" size={16} /> Descargar CV
              </Button>
            </a>
          )}
          {profile.email && (
            <a href={`mailto:${profile.email}`} style={{ textDecoration: 'none' }}>
              <Button size="lg" variant="ghost">
                <Icon name="mail" size={16} /> {profile.email}
              </Button>
            </a>
          )}
        </div>

        <div
          className="portfolio-hero-stats"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
            gap: 0,
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-lg)',
            background: 'var(--surface)',
            overflow: 'hidden',
            maxWidth: 880,
          }}
        >
          {stats.map((it, i) => (
            <div
              key={it.label}
              style={{
                padding: '16px 20px',
                borderLeft: i ? '1px solid var(--border)' : 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 11.5,
                  color: 'var(--text-faint)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                <Icon name={it.icon} size={12} /> {it.label}
              </span>
              <span style={{ fontSize: 15, fontWeight: 500 }}>{it.value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
