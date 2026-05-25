import type { Metadata } from 'next';
import Link from 'next/link';

import { AuthShell } from '../_components/auth-shell';
import { ResetForm } from '../_components/reset-form';

export const metadata: Metadata = {
  title: 'Nueva contraseña · Folio',
};

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Crea una nueva contraseña"
      subtitle="Elige una contraseña que no hayas usado antes."
      footer={
        <>
          <Link href="/login">Cancelar y volver</Link>
        </>
      }
    >
      <ResetForm />
    </AuthShell>
  );
}
