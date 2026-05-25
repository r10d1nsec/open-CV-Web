'use client';
import { SITE_DOMAIN } from '@/lib/site';

import Link from 'next/link';
import type { Route } from 'next';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Pill } from '@/components/ui/pill';
import { useTheme } from '@/components/providers/theme-provider';
import type { Profile } from '@/types/profile';

const SECTIONS: { label: string; href: string }[] = [
  { label: 'Proyectos', href: '#work' },
  { label: 'Reservas', href: '#booking' },
  { label: 'Contacto', href: '#contact' },
];

export function PortfolioNav({ profile }: { profile: Profile }) {
  const { theme, toggle } = useTheme();
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 56px',
        background: 'color-mix(in oklab, var(--bg) 75%, transparent)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
      }}
      className="portfolio-nav"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar size={28} initials={profile.initials} src={profile.avatarUrl} hue={220} />
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
          <span style={{ fontSize: 13.5, fontWeight: 600 }}>{profile.name}</span>
          <span className="mono" style={{ fontSize: 10.5, color: 'var(--text-faint)' }}>
            {SITE_DOMAIN}/{profile.username}
          </span>
        </div>
      </div>
      <nav style={{ display: 'flex', gap: 4 }} className="portfolio-nav-links">
        {SECTIONS.map(({ label, href }, i) => (
          <a
            key={href}
            href={href}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              fontSize: 13,
              color: i === 0 ? 'var(--text)' : 'var(--text-dim)',
              textDecoration: 'none',
              fontWeight: i === 0 ? 500 : 400,
            }}
          >
            {label}
          </a>
        ))}
      </nav>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        {profile.available && (
          <Pill dot style={{ color: 'var(--success)' }} className="portfolio-nav-avail">
            {profile.availableLine ?? 'Disponible'}
          </Pill>
        )}
        <Button
          variant="icon"
          size="sm"
          onClick={toggle}
          aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={14} />
        </Button>
        <Link href={`/${profile.username}/booking` as Route} style={{ textDecoration: 'none' }}>
          <Button variant="primary" size="sm">
            <Icon name="calendar" size={14} /> Reservar
          </Button>
        </Link>
      </div>
    </header>
  );
}
