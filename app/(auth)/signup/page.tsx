import type { Metadata } from 'next';
import Link from 'next/link';

import { AuthShell } from '../_components/auth-shell';
import { SignupForm } from '../_components/signup-form';

export const metadata: Metadata = {
  title: 'Crear cuenta · Folio',
};

export default function SignupPage() {
  return (
    <AuthShell
      title="Crear cuenta"
      subtitle="Empieza a construir tu portfolio en minutos."
      footer={
        <>
          ¿Ya tienes cuenta? <Link href="/login">Iniciar sesión</Link>
        </>
      }
    >
      <SignupForm />
    </AuthShell>
  );
}
