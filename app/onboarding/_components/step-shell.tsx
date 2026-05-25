'use client';

import { useFormStatus } from 'react-dom';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { ActionResult } from '@/app/onboarding/_actions/onboarding';

export function StepShell({
  title,
  subtitle,
  state,
  submitLabel,
  children,
}: {
  title: string;
  subtitle?: string;
  state: ActionResult | null;
  submitLabel: string;
  children: ReactNode;
}) {
  return (
    <Card style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
      <header>
        <h1 style={{ margin: 0, fontSize: 22, letterSpacing: '-0.01em' }}>{title}</h1>
        {subtitle && (
          <p style={{ margin: '6px 0 0', color: 'var(--text-dim)', fontSize: 14, lineHeight: 1.5 }}>
            {subtitle}
          </p>
        )}
      </header>
      {children}
      <StepFooter state={state} submitLabel={submitLabel} />
    </Card>
  );
}

function StepFooter({
  state,
  submitLabel,
}: {
  state: ActionResult | null;
  submitLabel: string;
}) {
  const { pending } = useFormStatus();
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
      }}
    >
      <output role="status" aria-live="polite" style={{ fontSize: 13 }}>
        {state?.ok === false && (
          <span role="alert" style={{ color: 'var(--danger)' }}>
            {state.error}
          </span>
        )}
      </output>
      <Button type="submit" variant="primary" size="md" disabled={pending} aria-busy={pending || undefined}>
        {pending ? 'Guardando…' : submitLabel}
      </Button>
    </div>
  );
}

export function FieldRow({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label htmlFor={htmlFor} style={{ fontSize: 13, color: 'var(--text-dim)' }}>
        {label}
      </label>
      {children}
      {hint && !error && (
        <p style={{ margin: 0, fontSize: 11.5, color: 'var(--text-faint)' }}>{hint}</p>
      )}
      {error && (
        <p role="alert" style={{ margin: 0, fontSize: 12, color: 'var(--danger)' }}>
          {error}
        </p>
      )}
    </div>
  );
}
