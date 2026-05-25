'use client';

import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { logout } from '@/app/(auth)/_actions/logout';

function Inner() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="ghost"
      size="md"
      disabled={pending}
      aria-busy={pending || undefined}
    >
      {pending ? 'Cerrando sesión…' : 'Cerrar sesión'}
    </Button>
  );
}

export function LogoutButton() {
  return (
    <form action={logout}>
      <Inner />
    </form>
  );
}
