'use client';

import { useActionState, useState } from 'react';
import { Textarea } from '@/components/ui/input';
import { FieldRow, StepShell } from '@/app/onboarding/_components/step-shell';
import { setBio, type ActionResult } from '@/app/onboarding/_actions/onboarding';

export function StepBio({ initial }: { initial: string }) {
  const [bio, setBioState] = useState(initial);
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    (prev, fd) => setBio(prev ?? { ok: true }, fd),
    null,
  );
  const fieldErr = state && !state.ok ? state.fieldErrors?.bio : undefined;

  return (
    <form action={formAction} noValidate>
      <StepShell
        title="Cuéntanos sobre ti"
        subtitle="2-3 frases: quién eres, qué te diferencia, qué buscas ahora."
        state={state}
        submitLabel="Continuar"
      >
        <FieldRow label="Bio" htmlFor="bio" hint={`${bio.length} / 500`} error={fieldErr}>
          <Textarea
            id="bio"
            name="bio"
            value={bio}
            onChange={(e) => setBioState(e.target.value)}
            placeholder="Soy desarrolladora frontend junior con foco en accesibilidad. Busco mi primer puesto en una startup con impacto social…"
            rows={5}
            maxLength={500}
            autoFocus
            required
          />
        </FieldRow>
      </StepShell>
    </form>
  );
}
