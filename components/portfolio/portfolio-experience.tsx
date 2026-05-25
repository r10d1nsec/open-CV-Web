import { Pill } from '@/components/ui/pill';
import { SectionTag } from '@/components/ui/section-tag';
import type { Profile } from '@/types/profile';

export function PortfolioExperience({ profile }: { profile: Profile }) {
  return (
    <section
      id="experience"
      className="portfolio-section"
      style={{ padding: '64px 56px', borderTop: '1px solid var(--border)' }}
    >
      <div
        className="portfolio-section-grid"
        style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 56, maxWidth: 1100, marginInline: 'auto' }}
      >
        <SectionTag num="02">Experience</SectionTag>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {profile.experience.map((x, i) => (
            <div
              key={`${x.org}-${x.role}`}
              style={{
                display: 'grid',
                gridTemplateColumns: '160px 1fr',
                gap: 28,
                padding: '22px 0',
                borderTop: i ? '1px solid var(--border)' : 'none',
              }}
              className="portfolio-exp-row"
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span className="mono" style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>
                  {x.period}
                </span>
                {x.current && (
                  <Pill
                    dot
                    style={{
                      color: 'var(--success)',
                      fontSize: 11,
                      padding: '2px 8px',
                      alignSelf: 'flex-start',
                      background: 'rgba(34,197,94,0.08)',
                      borderColor: 'rgba(34,197,94,0.25)',
                    }}
                  >
                    Current
                  </Pill>
                )}
              </div>
              <div>
                <div
                  style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}
                  className="portfolio-exp-head"
                >
                  <h3 style={{ fontSize: 18, margin: 0 }}>{x.role}</h3>
                  <span style={{ color: 'var(--text-faint)' }}>·</span>
                  <span style={{ color: 'var(--text-dim)', fontSize: 14.5 }}>{x.org}</span>
                </div>
                <p
                  style={{ margin: 0, color: 'var(--text-dim)', fontSize: 14, lineHeight: 1.55 }}
                >
                  {x.blurb}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
