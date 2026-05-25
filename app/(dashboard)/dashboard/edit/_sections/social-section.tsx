'use client';

import { useActionState } from 'react';
import { Input } from '@/components/ui/input';
import {
  updateSocial,
  type ActionResult,
} from '@/app/(dashboard)/dashboard/edit/_actions/update-profile';
import type { SocialInput } from '@/lib/validation/profile';
import { Field, SectionShell } from '@/app/(dashboard)/dashboard/edit/_components/section-shell';

const FIELDS: { name: keyof SocialInput; label: string; placeholder: string; hint?: string }[] = [
  { name: 'linkedin', label: 'LinkedIn', placeholder: 'maria-garcia', hint: 'Tu handle, no la URL completa.' },
  { name: 'github', label: 'GitHub', placeholder: 'mariagarcia' },
  { name: 'twitter', label: 'X / Twitter', placeholder: 'mariagarcia' },
  { name: 'figma', label: 'Figma', placeholder: 'maria' },
  { name: 'website', label: 'Web personal', placeholder: 'mariagarcia.dev', hint: 'Sin https://' },
  { name: 'read', label: 'Read.cv u otro CV', placeholder: 'maria' },
];

export function SocialSection({ initial }: { initial: SocialInput }) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    (prev, fd) => updateSocial(prev ?? { ok: true }, fd),
    null,
  );
  const fe = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <form action={formAction} noValidate>
      <SectionShell
        title="Enlaces sociales"
        subtitle="Solo los que uses activamente. Vacío = no se muestra."
        state={state}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {FIELDS.map((f) => (
            <Field
              key={f.name}
              label={f.label}
              name={f.name}
              hint={f.hint}
              error={fe?.[f.name]}
            >
              <Input
                id={f.name}
                name={f.name}
                defaultValue={initial[f.name] ?? ''}
                placeholder={f.placeholder}
                maxLength={80}
              />
            </Field>
          ))}
        </div>
      </SectionShell>
    </form>
  );
}
