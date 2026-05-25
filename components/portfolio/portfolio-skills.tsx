import { Pill } from '@/components/ui/pill';
import { SectionTag } from '@/components/ui/section-tag';
import type { Profile } from '@/types/profile';

export function PortfolioSkills({ profile }: { profile: Profile }) {
  return (
    <section
      id="about"
      className="portfolio-section"
      style={{ padding: '48px 56px', borderTop: '1px solid var(--border)' }}
    >
      <div
        className="portfolio-section-grid"
        style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 56, maxWidth: 1100, marginInline: 'auto' }}
      >
        <SectionTag num="01">Toolkit</SectionTag>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {Object.entries(profile.skills).map(([group, items]) => (
            <div
              key={group}
              style={{
                display: 'grid',
                gridTemplateColumns: '120px 1fr',
                gap: 24,
                alignItems: 'baseline',
              }}
              className="portfolio-skill-row"
            >
              <span style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-dim)' }}>
                {group}
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {items.map((s) => (
                  <Pill key={s} variant="mono">
                    {s}
                  </Pill>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
