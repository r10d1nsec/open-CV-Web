import type { ReactNode } from 'react';

export function SectionTag({ num, children }: { num?: string; children: ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        letterSpacing: '0.06em',
        color: 'var(--text-faint)',
        textTransform: 'uppercase',
      }}
    >
      {num && <span style={{ color: 'var(--accent)' }}>{num}</span>}
      <span style={{ width: 18, height: 1, background: 'var(--border-strong)' }} />
      {children}
    </div>
  );
}
