'use client';

import { useActionState } from 'react';
import { Input } from '@/components/ui/input';
import { FieldRow, StepShell } from '@/app/onboarding/_components/step-shell';
import { setIdentity, type ActionResult } from '@/app/onboarding/_actions/onboarding';

export function StepIdentity({ initial }: { initial: string }) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    (prev, fd) => setIdentity(prev ?? { ok: true }, fd),
    null,
  );
  const fieldErr = state && !state.ok ? state.fieldErrors?.full_name : undefined;

  return (
    <form action={formAction} noValidate>
      <StepShell
        title="¿Cómo te llamas?"
        subtitle="Aparecerá en la cabecera de tu perfil y en tu tarjeta digital."
        state={state}
        submitLabel="Continuar"
      >
        <FieldRow label="Nombre completo" htmlFor="full_name" error={fieldErr}>
          <Input
            id="full_name"
            name="full_name"
            defaultValue={initial}
            placeholder="ej. María García"
            autoComplete="name"
            autoFocus
            maxLength={80}
            required
          />
        </FieldRow>
      </StepShell>
    </form>
  );
}
