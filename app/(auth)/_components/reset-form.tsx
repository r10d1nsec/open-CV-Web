'use client';

import { useActionState } from 'react';

import { resetPassword } from '@/app/(auth)/_actions/reset-password';
import type { ActionResult } from '@/lib/auth/schema';

import { FormField } from './form-field';
import { SubmitButton } from './submit-button';

async function resetAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult | null> {
  return resetPassword(formData);
}

export function ResetForm() {
  const [state, action] = useActionState<ActionResult | null, FormData>(resetAction, null);
  const formError = state && !state.ok && state.field === 'form' ? state.error : undefined;
  const fieldError = state && !state.ok ? state.error : undefined;
  const errorField = state && !state.ok ? state.field : undefined;

  return (
    <form action={action} className="auth-form" noValidate>
      {formError ? (
        <div className="auth-form__alert" role="alert">
          {formError}
        </div>
      ) : null}
      <FormField
        label="Nueva contraseña"
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
        error={fieldError}
        errorField={errorField}
      />
      <FormField
        label="Repite la contraseña"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
        error={fieldError}
        errorField={errorField}
      />
      <p className="auth-form__hint">Mínimo 8 caracteres.</p>
      <SubmitButton pendingLabel="Guardando…">Guardar contraseña</SubmitButton>
    </form>
  );
}
