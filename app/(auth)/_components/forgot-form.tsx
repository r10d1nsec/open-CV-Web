'use client';

import { useActionState } from 'react';

import { forgotPassword } from '@/app/(auth)/_actions/forgot-password';
import type { ActionResult } from '@/lib/auth/schema';

import { FormField } from './form-field';
import { SubmitButton } from './submit-button';

async function forgotAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult | null> {
  return forgotPassword(formData);
}

export function ForgotForm() {
  const [state, action] = useActionState<ActionResult | null, FormData>(forgotAction, null);

  if (state?.ok) {
    return (
      <div className="auth-form__success" role="status">
        Si ese email está registrado, te hemos enviado un enlace para restablecer la contraseña.
        Revisa tu bandeja de entrada y la carpeta de spam.
      </div>
    );
  }

  const fieldError = state && !state.ok ? state.error : undefined;
  const errorField = state && !state.ok ? state.field : undefined;
  const formError = state && !state.ok && state.field === 'form' ? state.error : undefined;

  return (
    <form action={action} className="auth-form" noValidate>
      {formError ? (
        <div className="auth-form__alert" role="alert">
          {formError}
        </div>
      ) : null}
      <FormField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        error={fieldError}
        errorField={errorField}
      />
      <p className="auth-form__hint">
        Te enviaremos un enlace para crear una nueva contraseña.
      </p>
      <SubmitButton pendingLabel="Enviando…">Enviar enlace</SubmitButton>
    </form>
  );
}
