'use client';

import { useActionState } from 'react';
import { Input } from '@/components/ui/input';
import { FieldRow, StepShell } from '@/app/onboarding/_components/step-shell';
import { setHeadline, type ActionResult } from '@/app/onboarding/_actions/onboarding';

export function StepHeadline({ initial }: { initial: string }) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    (prev, fd) => setHeadline(prev ?? { ok: true }, fd),
    null,
  );
  const fieldErr = state && !state.ok ? state.fieldErrors?.title : undefined;

  return (
    <form action={formAction} noValidate>
      <StepShell
        title="¿Qué te describe profesionalmente?"
        subtitle="Una línea. La verán los reclutadores en el primer pantallazo."
        state={state}
        submitLabel="Continuar"
      >
        <FieldRow label="Titular profesional" htmlFor="title" error={fieldErr}>
          <Input
            id="title"
            name="title"
            defaultValue={initial}
            placeholder="ej. Desarrolladora frontend junior · React + TypeScript"
            autoFocus
            maxLength={120}
            required
          />
        </FieldRow>
      </StepShell>
    </form>
  );
}
