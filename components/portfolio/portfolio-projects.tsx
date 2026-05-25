import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Pill } from '@/components/ui/pill';
import { SectionTag } from '@/components/ui/section-tag';
import type { Profile, Project } from '@/types/profile';

function ProjectCard({ p }: { p: Project }) {
  const href = p.liveUrl ?? p.githubUrl;
  const card = (
    <Card
      hover
      className="project-card"
      style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', cursor: href ? 'pointer' : 'default', height: '100%' }}
    >
      <div
        style={{
          aspectRatio: '16 / 10',
          background: p.imageUrl
            ? `url(${p.imageUrl}) center/cover`
            : `linear-gradient(135deg, ${p.color}, color-mix(in oklab, ${p.color} 30%, #0a0d12))`,
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: p.imageUrl
              ? 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.65))'
              : 'repeating-linear-gradient(45deg, transparent 0 12px, rgba(255,255,255,0.04) 12px 13px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 14,
            left: 16,
            fontSize: 18,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.95)',
            letterSpacing: '-0.02em',
          }}
        >
          {p.title}
        </div>
        <div
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 28,
            height: 28,
            borderRadius: 8,
            background: 'rgba(0,0,0,0.35)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(255,255,255,0.85)',
          }}
        >
          <Icon name="external" size={14} />
        </div>
      </div>
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="mono" style={{ fontSize: 11, color: 'var(--text-faint)' }}>
            {p.tag}
          </span>
          {p.githubUrl && <Icon name="github" size={14} style={{ color: 'var(--text-faint)' }} />}
        </div>
        <p style={{ margin: 0, fontSize: 13.5, color: 'var(--text-dim)', lineHeight: 1.5 }}>
          {p.blurb}
        </p>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 4 }}>
          {p.stack.map((s) => (
            <Pill key={s} variant="mono" style={{ fontSize: 10.5, padding: '2px 8px' }}>
              {s}
            </Pill>
          ))}
        </div>
      </div>
    </Card>
  );

  if (!href) return card;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
      {card}
    </a>
  );
}

export function PortfolioProjects({ profile }: { profile: Profile }) {
  return (
    <section
      id="work"
      className="portfolio-section"
      style={{ padding: '64px 56px', borderTop: '1px solid var(--border)' }}
    >
      <div style={{ maxWidth: 1100, marginInline: 'auto' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 28,
          }}
        >
          <SectionTag num="03">Selected work</SectionTag>
          <a
            href="#work"
            style={{
              fontSize: 13,
              color: 'var(--text-dim)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            All {profile.projects.length} projects <Icon name="arrow" size={12} />
          </a>
        </div>
        <div
          className="portfolio-projects-grid"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}
        >
          {profile.projects.map((p) => (
            <ProjectCard key={p.title} p={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
