'use client';

import { useActionState } from 'react';
import { Input } from '@/components/ui/input';
import {
  updateIdentity,
  type ActionResult,
} from '@/app/(dashboard)/dashboard/edit/_actions/update-profile';
import type { IdentityInput } from '@/lib/validation/profile';
import { Field, SectionShell } from '@/app/(dashboard)/dashboard/edit/_components/section-shell';

export function IdentitySection({ initial }: { initial: IdentityInput }) {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    (prev, fd) => updateIdentity(prev ?? { ok: true }, fd),
    null,
  );
  const fe = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <form action={formAction} noValidate>
      <SectionShell
        title="Identidad"
        subtitle="Lo que verán los reclutadores en la cabecera de tu CV."
        state={state}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Nombre completo" name="name" error={fe?.name}>
            <Input id="name" name="name" defaultValue={initial.name} required maxLength={80} />
          </Field>
          <Field label="Titular profesional" name="title" error={fe?.title}>
            <Input
              id="title"
              name="title"
              defaultValue={initial.title}
              required
              maxLength={120}
              placeholder="ej. Desarrollador Frontend junior"
            />
          </Field>
          <Field label="Ubicación" name="location" error={fe?.location}>
            <Input id="location" name="location" defaultValue={initial.location} maxLength={80} />
          </Field>
          <Field
            label="Idiomas"
            name="languages"
            hint="Separados por coma. Máx. 6."
            error={fe?.['languages']}
          >
            <Input
              id="languages"
              name="languages"
              defaultValue={(initial.languages ?? []).join(', ')}
              maxLength={200}
            />
          </Field>
          <Field
            label="Tarifa (opcional)"
            name="hourly"
            hint="Texto libre. Ej.: 30€/hr · A negociar."
            error={fe?.hourly}
          >
            <Input id="hourly" name="hourly" defaultValue={initial.hourly ?? ''} maxLength={40} />
          </Field>
          <Field
            label="Estado de disponibilidad"
            name="availableLine"
            hint="Una línea corta. Visible bajo tu nombre."
            error={fe?.availableLine}
          >
            <Input
              id="availableLine"
              name="availableLine"
              defaultValue={initial.availableLine ?? ''}
              maxLength={80}
            />
          </Field>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
          <input
            type="checkbox"
            name="available"
            defaultChecked={initial.available}
            style={{ width: 16, height: 16 }}
          />
          Mostrar como disponible para nuevos proyectos
        </label>

        <Field
          label="Enlace a tu CV (opcional)"
          name="cvUrl"
          hint="Pega un enlace compartible (Google Drive, Dropbox, tu web…). Aparecerá como botón en tu portfolio y tu tarjeta."
          error={fe?.cvUrl}
        >
          <Input
            id="cvUrl"
            name="cvUrl"
            type="url"
            inputMode="url"
            defaultValue={initial.cvUrl ?? ''}
            maxLength={500}
            placeholder="https://drive.google.com/file/d/…/view"
          />
        </Field>
        <details style={{ fontSize: 12.5, color: 'var(--text-dim)' }}>
          <summary style={{ cursor: 'pointer', color: 'var(--accent)' }}>
            ¿Cómo consigo el enlace de Google Drive?
          </summary>
          <ol style={{ margin: '8px 0 0', paddingLeft: 18, lineHeight: 1.7 }}>
            <li>Sube tu CV (PDF) a tu Google Drive.</li>
            <li>Click derecho sobre el archivo → <strong>Compartir</strong>.</li>
            <li>En “Acceso general”, cambia a <strong>“Cualquier persona con el enlace”</strong> (lector).</li>
            <li>Pulsa <strong>Copiar enlace</strong> y pégalo aquí arriba.</li>
          </ol>
          <p style={{ margin: '8px 0 0' }}>
            Consejo: usa un PDF, no un Google Doc editable, para que se vea igual en cualquier dispositivo.
          </p>
        </details>
      </SectionShell>
    </form>
  );
}
