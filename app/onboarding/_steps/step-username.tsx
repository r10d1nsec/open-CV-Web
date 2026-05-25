'use client';
import { SITE_DOMAIN } from '@/lib/site';

import { useActionState, useState } from 'react';
import { Input } from '@/components/ui/input';
import { FieldRow, StepShell } from '@/app/onboarding/_components/step-shell';
import { setUsername, type ActionResult } from '@/app/onboarding/_actions/onboarding';

export function StepUsername({ initial }: { initial: string }) {
  const placeholder = initial.startsWith('user-') ? '' : initial;
  const [value, setValue] = useState(placeholder);
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    (prev, fd) => setUsername(prev ?? { ok: true }, fd),
    null,
  );
  const fieldErr = state && !state.ok ? state.fieldErrors?.username : undefined;
  const preview = value
    ? value.trim().toLowerCase()
    : '<tu-url>';

  return (
    <form action={formAction} noValidate>
      <StepShell
        title="Reserva tu URL pública"
        subtitle="Será tu enlace para compartir. Solo minúsculas, dígitos y guiones (2-30)."
        state={state}
        submitLabel="Continuar"
      >
        <FieldRow label="Username" htmlFor="username" error={fieldErr} hint="Sin guiones al inicio/final ni dobles.">
          <Input
            id="username"
            name="username"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="ej. maria-garcia"
            autoComplete="off"
            autoFocus
            maxLength={30}
            required
          />
        </FieldRow>
        <p
          className="mono"
          style={{
            fontSize: 12,
            color: 'var(--text-faint)',
            background: 'var(--surface-2)',
            padding: '8px 12px',
            borderRadius: 'var(--r-md)',
            border: '1px solid var(--border)',
          }}
        >
          {SITE_DOMAIN}/<span style={{ color: 'var(--text-dim)' }}>{preview}</span>
        </p>
      </StepShell>
    </form>
  );
}
