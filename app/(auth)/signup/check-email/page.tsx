import type { Metadata } from 'next';
import Link from 'next/link';

import { Icon } from '@/components/ui/icon';

import { AuthShell } from '../../_components/auth-shell';

export const metadata: Metadata = {
  title: 'Revisa tu email · Folio',
};

type SearchParams = Promise<{ email?: string }>;

export default async function CheckEmailPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const email = params.email;

  return (
    <AuthShell
      title="Revisa tu email"
      subtitle={
        email
          ? `Hemos enviado un enlace a ${email}.`
          : 'Hemos enviado un enlace de confirmación a tu correo.'
      }
      footer={
        <>
          <Link href="/login">Volver a iniciar sesión</Link>
        </>
      }
    >
      <div className="auth-check-card card">
        <div className="auth-check-card__icon" aria-hidden="true">
          <Icon name="mail" size={28} />
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: 'var(--text-dim)' }}>
            Haz click en el enlace que te hemos enviado para confirmar tu cuenta.
            <br />
            Si no lo ves, revisa la carpeta de spam.
          </p>
        </div>
      </div>
    </AuthShell>
  );
}
