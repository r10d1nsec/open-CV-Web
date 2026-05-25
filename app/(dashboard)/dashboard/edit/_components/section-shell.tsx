'use client';

import { useFormStatus } from 'react-dom';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { ActionResult } from '@/app/(dashboard)/dashboard/edit/_actions/update-profile';

export function SectionShell({
  title,
  subtitle,
  state,
  children,
}: {
  title: string;
  subtitle?: string;
  state: ActionResult | null;
  children: ReactNode;
}) {
  return (
    <Card style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <header>
        <h2 style={{ margin: 0, fontSize: 18, letterSpacing: '-0.01em' }}>{title}</h2>
        {subtitle && (
          <p style={{ margin: '4px 0 0', color: 'var(--text-dim)', fontSize: 13 }}>{subtitle}</p>
        )}
      </header>
      {children}
      <SectionFooter state={state} />
    </Card>
  );
}

function SectionFooter({ state }: { state: ActionResult | null }) {
  const { pending } = useFormStatus();
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
        marginTop: 4,
      }}
    >
      <output role="status" aria-live="polite" style={{ fontSize: 13 }}>
        {state?.ok === true && <span style={{ color: 'var(--success)' }}>Guardado ✓</span>}
        {state?.ok === false && (
          <span role="alert" style={{ color: 'var(--danger)' }}>
            {state.error}
          </span>
        )}
      </output>
      <Button type="submit" variant="primary" size="md" disabled={pending} aria-busy={pending || undefined}>
        {pending ? 'Guardando…' : 'Guardar cambios'}
      </Button>
    </div>
  );
}

export function Field({
  label,
  name,
  hint,
  error,
  children,
}: {
  label: string;
  name: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  const errorId = `${name}-error`;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label htmlFor={name} style={{ fontSize: 12.5, color: 'var(--text-dim)' }}>
        {label}
      </label>
      {children}
      {hint && !error && (
        <p style={{ margin: 0, fontSize: 11.5, color: 'var(--text-faint)' }}>{hint}</p>
      )}
      {error && (
        <p id={errorId} role="alert" style={{ margin: 0, fontSize: 12, color: 'var(--danger)' }}>
          {error}
        </p>
      )}
    </div>
  );
}
