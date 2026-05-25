import type { Metadata } from 'next';
import Link from 'next/link';

import { AuthShell } from '../_components/auth-shell';
import { ForgotForm } from '../_components/forgot-form';

export const metadata: Metadata = {
  title: 'Recuperar contraseña · Folio',
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="¿Olvidaste tu contraseña?"
      subtitle="Introduce tu email y te enviaremos un enlace para crear una nueva."
      footer={
        <>
          ¿La recordaste? <Link href="/login">Volver a iniciar sesión</Link>
        </>
      }
    >
      <ForgotForm />
    </AuthShell>
  );
}
