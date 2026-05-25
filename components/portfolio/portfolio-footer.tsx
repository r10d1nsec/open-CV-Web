import Link from 'next/link';
import type { Profile } from '@/types/profile';

export function PortfolioFooter({ profile }: { profile: Profile }) {
  const year = new Date().getFullYear();
  return (
    <footer
      className="portfolio-footer"
      style={{
        padding: '24px 56px',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'var(--text-faint)',
        fontSize: 12,
      }}
    >
      <span className="mono">
        © {year} {profile.name}
      </span>
      <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
        Hecho con <strong style={{ color: 'var(--text-dim)' }}>Folio</strong>
      </Link>
    </footer>
  );
}
