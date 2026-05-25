'use client';

import { useActionState } from 'react';

import { signup } from '@/app/(auth)/_actions/signup';
import type { ActionResult } from '@/lib/auth/schema';

import { isGoogleOAuthEnabled } from '@/lib/features';
import { FormField } from './form-field';
import { SubmitButton } from './submit-button';
import { GoogleButton } from './google-button';

async function signupAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult | null> {
  return signup(formData);
}

export function SignupForm() {
  const [state, action] = useActionState<ActionResult | null, FormData>(signupAction, null);
  const formError = state && !state.ok && state.field === 'form' ? state.error : undefined;
  const fieldError = state && !state.ok ? state.error : undefined;
  const errorField = state && !state.ok ? state.field : undefined;

  const googleEnabled = isGoogleOAuthEnabled();

  return (
    <div className="auth-form" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {googleEnabled && (
        <>
          <GoogleButton label="Registrarse con Google" />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              color: 'var(--text-faint)',
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
            aria-hidden
          >
            <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            o con email
            <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>
        </>
      )}

      <form action={action} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
        <FormField
          label="Contraseña"
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
        <SubmitButton pendingLabel="Creando cuenta…">Crear cuenta</SubmitButton>
      </form>
    </div>
  );
}
