'use client';

import { useActionState, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Field } from '@/app/(dashboard)/dashboard/edit/_components/section-shell';
import {
  deleteAccount,
  type DeleteAccountResult,
} from '@/app/(dashboard)/dashboard/settings/_actions/delete-account';

/**
 * Formulario de borrado de cuenta con doble fricción (escribir username +
 * contraseña). Alineado con la maqueta `settings` → DeleteModal de Claude
 * Design (typed-username friction).
 */
export function DeleteAccountForm({ username }: { username: string }) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const [state, formAction] = useActionState<DeleteAccountResult | null, FormData>(
    (prev, fd) => deleteAccount(prev, fd),
    null,
  );
  const matches = typed.trim().toLowerCase() === username.toLowerCase();

  if (!open) {
    return (
      <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(true)} style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>
        Borrar cuenta…
      </Button>
    );
  }

  return (
    <form action={formAction} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <p style={{ margin: 0, fontSize: 13, color: 'var(--text-dim)' }}>
        Esto borra <strong>permanentemente</strong> tu cuenta, tu portfolio, tu tarjeta y todos tus
        datos. No se puede deshacer.
      </p>
      <Field
        label={`Escribe tu username (${username}) para confirmar`}
        name="confirmUsername"
        error={state && !state.ok ? state.error : undefined}
      >
        <Input
          name="confirmUsername"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder={username}
          autoComplete="off"
        />
      </Field>
      <Field label="Tu contraseña" name="password">
        <Input name="password" type="password" autoComplete="current-password" placeholder="••••••••" />
      </Field>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <Button type="submit" variant="primary" size="md" disabled={!matches} style={matches ? { background: 'var(--danger)', borderColor: 'var(--danger)' } : undefined}>
          Borrar mi cuenta para siempre
        </Button>
        <Button type="button" variant="ghost" size="md" onClick={() => setOpen(false)}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
