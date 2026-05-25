/**
 * FormField — covers the contract used by every auth form:
 *   - label/input wiring via id
 *   - aria-invalid + aria-describedby + role=alert when errored
 *   - password type swaps to text when the toggle is pressed
 *
 * Forms themselves are exercised via e2e — these unit tests just lock the
 * primitive's contract so a regression here can't go silent.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import { FormField } from '@/app/(auth)/_components/form-field';

afterEach(cleanup);

describe('<FormField>', () => {
  it('associates the label with the input', () => {
    render(<FormField label="Email" name="email" type="email" />);
    const input = screen.getByLabelText('Email');
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe('INPUT');
  });

  it('renders no error UI when error is undefined', () => {
    render(<FormField label="Email" name="email" type="email" />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Email')).not.toHaveAttribute('aria-invalid');
  });

  it('renders aria-invalid + role=alert when error matches this field', () => {
    render(
      <FormField label="Email" name="email" type="email" error="Email inválido" errorField="email" />,
    );
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Email inválido');
    expect(input.getAttribute('aria-describedby')).toBe(alert.id);
  });

  it('ignores the error when errorField targets a different field', () => {
    render(
      <FormField
        label="Email"
        name="email"
        type="email"
        error="Las contraseñas no coinciden"
        errorField="confirmPassword"
      />,
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Email')).not.toHaveAttribute('aria-invalid');
  });

  it('renders password type by default for password inputs and toggles to text', () => {
    render(<FormField label="Contraseña" name="password" type="password" />);
    const input = screen.getByLabelText('Contraseña') as HTMLInputElement;
    expect(input.type).toBe('password');

    const toggle = screen.getByRole('button', { name: /mostrar contraseña/i });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(toggle);

    expect(input.type).toBe('text');
    expect(toggle).toHaveAccessibleName(/ocultar contraseña/i);
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
  });

  it('does not render the toggle for non-password fields', () => {
    render(<FormField label="Email" name="email" type="email" />);
    expect(screen.queryByRole('button', { name: /contraseña/i })).not.toBeInTheDocument();
  });
});
