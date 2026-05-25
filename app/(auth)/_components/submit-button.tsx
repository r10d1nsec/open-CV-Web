'use client';

import { useFormStatus } from 'react-dom';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';

export function SubmitButton({
  children,
  pendingLabel,
}: {
  children: ReactNode;
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="primary"
      size="lg"
      className="auth-form__submit"
      disabled={pending}
      aria-busy={pending || undefined}
    >
      {pending ? (pendingLabel ?? 'Procesando…') : children}
    </Button>
  );
}
