'use client';

import { useActionState } from 'react';

import { login } from '@/app/(auth)/_actions/login';
import type { ActionResult } from '@/lib/auth/schema';

import { isGoogleOAuthEnabled } from '@/lib/features';
import { FormField } from './form-field';
import { SubmitButton } from './submit-button';
import { GoogleButton } from './google-button';

async function loginAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult | null> {
  return login(formData);
}

export function LoginForm({ resetOk = false, next }: { resetOk?: boolean; next?: string }) {
  const [state, action] = useActionState<ActionResult | null, FormData>(loginAction, null);
  const formError = state && !state.ok && state.field === 'form' ? state.error : undefined;
  const fieldError = state && !state.ok ? state.error : undefined;
  const errorField = state && !state.ok ? state.field : undefined;

  const googleEnabled = isGoogleOAuthEnabled();

  return (
    <div className="auth-form" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {resetOk ? (
        <div className="auth-form__success" role="status">
          Tu contraseña se actualizó correctamente. Inicia sesión con la nueva.
        </div>
      ) : null}

      {googleEnabled && (
        <>
          <GoogleButton label="Continuar con Google" />
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
        {next ? <input type="hidden" name="next" value={next} /> : null}
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
          autoComplete="current-password"
          required
          error={fieldError}
          errorField={errorField}
        />
        <SubmitButton pendingLabel="Entrando…">Entrar</SubmitButton>
      </form>
    </div>
  );
}
