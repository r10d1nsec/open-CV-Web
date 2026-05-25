'use client';

import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { signInWithGoogle } from '@/app/(auth)/_actions/signin-google';

function Inner({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="secondary"
      size="lg"
      disabled={pending}
      aria-busy={pending || undefined}
      className="auth-form__submit"
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
    >
      <GoogleGlyph />
      {pending ? 'Conectando…' : label}
    </Button>
  );
}

export function GoogleButton({ label = 'Continuar con Google' }: { label?: string }) {
  return (
    <form action={signInWithGoogle} style={{ display: 'contents' }}>
      <Inner label={label} />
    </form>
  );
}

function GoogleGlyph() {
  // Logo oficial multi-color simplificado, 16px.
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8a12 12 0 1 1 0-24c3.1 0 5.9 1.1 8 3l5.7-5.7C34 5.5 29.3 3.6 24 3.6 12.7 3.6 3.6 12.7 3.6 24S12.7 44.4 24 44.4c11 0 20.4-8 20.4-20.4 0-1.4-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.6 16 18.9 13 24 13c3.1 0 5.9 1.1 8 3l5.7-5.7C34 5.5 29.3 3.6 24 3.6c-7.7 0-14.4 4.4-17.7 11.1z"
      />
      <path
        fill="#4CAF50"
        d="M24 44.4c5.2 0 10-2 13.6-5.3l-6.3-5.3a12 12 0 0 1-18.5-5.7l-6.6 5.1C9.5 40 16.2 44.4 24 44.4z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4 5.9l6.3 5.3c-.4.4 6.8-4.9 6.8-15.2 0-1.4-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}
