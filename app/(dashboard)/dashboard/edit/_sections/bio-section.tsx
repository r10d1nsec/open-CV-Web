'use client';

import { useActionState, useState } from 'react';
import { Textarea } from '@/components/ui/input';
import {
  updateBio,
  type ActionResult,
} from '@/app/(dashboard)/dashboard/edit/_actions/update-profile';
import { Field, SectionShell } from '@/app/(dashboard)/dashboard/edit/_components/section-shell';

export function BioSection({ initial }: { initial: string }) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    (prev, fd) => updateBio(prev ?? { ok: true }, fd),
    null,
  );
  const [bio, setBio] = useState(initial);
  const fe = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <form action={formAction} noValidate>
      <SectionShell
        title="Bio"
        subtitle="2-3 frases. Quién eres, qué te diferencia, qué buscas."
        state={state}
      >
        <Field
          label="Sobre ti"
          name="bio"
          hint={`${bio.length} / 500`}
          error={fe?.bio}
        >
          <Textarea
            id="bio"
            name="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={5}
            maxLength={500}
            placeholder="Soy desarrollador frontend junior con foco en accesibilidad. Busco mi primera oportunidad en una startup con impacto social…"
          />
        </Field>
      </SectionShell>
    </form>
  );
}
