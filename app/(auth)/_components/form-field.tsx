'use client';

import { useState, useId, type InputHTMLAttributes } from 'react';

import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';

type Field = 'email' | 'password' | 'confirmPassword' | 'form';

export type FormFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: string;
  name: Exclude<Field, 'form'>;
  type?: 'email' | 'password' | 'text';
  error?: string;
  /** Compare against ActionResult.field to mark this input as errored. */
  errorField?: Field;
};

export function FormField({
  label,
  name,
  type = 'text',
  error,
  errorField,
  id: idProp,
  ...rest
}: FormFieldProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const errorId = `${id}-error`;
  const isPassword = type === 'password';
  const [reveal, setReveal] = useState(false);
  const inputType = isPassword && reveal ? 'text' : type;

  const hasError = Boolean(error) && (errorField === undefined || errorField === name);

  return (
    <div className={`auth-form__row${hasError ? ' has-error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      <div className={isPassword ? 'auth-form__pwwrap' : undefined}>
        <Input
          id={id}
          name={name}
          type={inputType}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? errorId : undefined}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            className="auth-form__pwtoggle"
            aria-label={reveal ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            aria-pressed={reveal}
            onClick={() => setReveal((v) => !v)}
            tabIndex={0}
          >
            <Icon name={reveal ? 'eyeOff' : 'eye'} size={16} />
          </button>
        )}
      </div>
      {hasError && (
        <p id={errorId} role="alert" className="auth-form__error">
          {error}
        </p>
      )}
    </div>
  );
}
