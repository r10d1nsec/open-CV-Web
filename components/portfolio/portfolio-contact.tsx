import { Button } from '@/components/ui/button';
import { Icon, type IconName } from '@/components/ui/icon';
import { Input, Textarea } from '@/components/ui/input';
import { SectionTag } from '@/components/ui/section-tag';
import type { Profile } from '@/types/profile';

export function PortfolioContact({ profile }: { profile: Profile }) {
  const links: Array<{ icon: IconName; label: string; href: string }> = [
    { icon: 'mail', label: profile.email, href: `mailto:${profile.email}` },
    ...(profile.phone ? [{ icon: 'phone' as const, label: profile.phone, href: `tel:${profile.phone.replace(/\s/g, '')}` }] : []),
    ...(profile.social.linkedin
      ? [
          {
            icon: 'linkedin' as const,
            label: `linkedin.com/in/${profile.social.linkedin}`,
            href: `https://linkedin.com/in/${profile.social.linkedin}`,
          },
        ]
      : []),
    ...(profile.social.github
      ? [
          {
            icon: 'github' as const,
            label: `github.com/${profile.social.github}`,
            href: `https://github.com/${profile.social.github}`,
          },
        ]
      : []),
  ];

  return (
    <section
      id="contact"
      className="portfolio-section"
      style={{ padding: '64px 56px 100px', borderTop: '1px solid var(--border)' }}
    >
      <div
        className="portfolio-section-grid"
        style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 56, maxWidth: 1100, marginInline: 'auto' }}
      >
        <SectionTag num="05">Contact</SectionTag>
        <div
          className="portfolio-contact-grid"
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}
        >
          <div>
            <h2 style={{ fontSize: 28, marginBottom: 16 }}>Get in touch</h2>
            <p style={{ color: 'var(--text-dim)', marginBottom: 24, lineHeight: 1.55 }}>
              Briefs, intros, or just hello. I read everything and reply within two working days.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {links.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 12px',
                    borderRadius: 'var(--r-md)',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    textDecoration: 'none',
                    fontSize: 13.5,
                  }}
                >
                  <Icon name={l.icon} size={15} style={{ color: 'var(--text-dim)' }} />
                  {l.label}
                  <Icon
                    name="external"
                    size={12}
                    style={{ color: 'var(--text-faint)', marginLeft: 'auto' }}
                  />
                </a>
              ))}
            </div>
          </div>
          <form style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div
              className="portfolio-contact-name-row"
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}
            >
              <Input placeholder="Your name" name="name" required />
              <Input placeholder="Email" type="email" name="email" required />
            </div>
            <Input placeholder="Subject" name="subject" />
            <Textarea rows={6} placeholder="Tell me about the project…" name="message" required />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 4,
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <span className="mono" style={{ fontSize: 11, color: 'var(--text-faint)' }}>
                Encrypted via Resend · No newsletters, ever
              </span>
              <Button variant="primary" type="submit">
                Send <Icon name="arrow" size={14} />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
