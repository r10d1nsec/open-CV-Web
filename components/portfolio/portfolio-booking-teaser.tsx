import Link from 'next/link';
import type { Route } from 'next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Pill } from '@/components/ui/pill';
import { SectionTag } from '@/components/ui/section-tag';
import { formatDuration } from '@/lib/service';
import type { Profile } from '@/types/profile';

export function PortfolioBookingTeaser({ profile }: { profile: Profile }) {
  const featured = profile.services.slice(0, 3);
  return (
    <section
      id="booking"
      className="portfolio-section"
      style={{ padding: '72px 56px', borderTop: '1px solid var(--border)' }}
    >
      <Card
        className="portfolio-booking-card"
        style={{
          padding: 40,
          maxWidth: 1100,
          marginInline: 'auto',
          background:
            'linear-gradient(135deg, var(--surface), color-mix(in oklab, var(--accent) 8%, var(--surface)))',
          borderColor: 'rgba(var(--accent-rgb), 0.25)',
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: 40,
        }}
      >
        <div>
          <SectionTag num="04">Reservas</SectionTag>
          <h2 style={{ fontSize: 34, marginTop: 14, marginBottom: 12, letterSpacing: '-0.02em' }}>
            ¿Hablamos? Reserva una cita.
          </h2>
          <p
            style={{
              color: 'var(--text-dim)',
              fontSize: 15,
              maxWidth: 460,
              marginBottom: 24,
              lineHeight: 1.55,
            }}
          >
            Elige un servicio y un hueco disponible. Reviso cada solicitud y te confirmo por email.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link href={`/${profile.username}/booking` as Route} style={{ textDecoration: 'none' }}>
              <Button variant="primary">
                <Icon name="calendar" size={14} /> Ver huecos disponibles
              </Button>
            </Link>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {featured.map((s) => (
            <div
              key={s.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 16px',
                borderRadius: 'var(--r-md)',
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  {s.name}
                  {s.popular && (
                    <Pill variant="accent" style={{ fontSize: 10, padding: '1px 7px' }}>
                      Popular
                    </Pill>
                  )}
                </div>
                <div
                  className="mono"
                  style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}
                >
                  {formatDuration(s.duration)}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontWeight: 500, fontSize: 14 }}>{s.price}</span>
                <Icon name="chevron" size={14} style={{ color: 'var(--text-faint)' }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}
