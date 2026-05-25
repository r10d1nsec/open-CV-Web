import type { CSSProperties } from 'react';

const STEPS = ['Username', 'Nombre', 'Headline', 'Bio', 'Avatar'] as const;
export type StepIndex = 1 | 2 | 3 | 4 | 5;

export function Stepper({ current }: { current: StepIndex }) {
  return (
    <nav aria-label="Progreso del onboarding" style={{ marginBottom: 24 }}>
      <ol
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          fontSize: 12,
          color: 'var(--text-faint)',
        }}
      >
        {STEPS.map((label, i) => {
          const idx = (i + 1) as StepIndex;
          const isDone = idx < current;
          const isCurrent = idx === current;
          const dotStyle: CSSProperties = {
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: isDone ? 'var(--accent)' : isCurrent ? 'var(--surface)' : 'transparent',
            border: `1px solid ${isCurrent || isDone ? 'var(--accent)' : 'var(--border)'}`,
            color: isDone ? 'var(--bg)' : isCurrent ? 'var(--accent)' : 'var(--text-faint)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 10,
            fontWeight: 600,
          };
          return (
            <li
              key={label}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              aria-current={isCurrent ? 'step' : undefined}
            >
              <span style={dotStyle}>{isDone ? '✓' : idx}</span>
              <span
                style={{
                  color: isCurrent ? 'var(--text)' : isDone ? 'var(--text-dim)' : 'var(--text-faint)',
                  fontWeight: isCurrent ? 500 : 400,
                }}
              >
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <span aria-hidden style={{ color: 'var(--text-faint)', marginInline: 4 }}>
                  ›
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
