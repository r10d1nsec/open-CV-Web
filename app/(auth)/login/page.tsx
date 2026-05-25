import type { Metadata } from 'next';
import Link from 'next/link';

import { AuthShell } from '../_components/auth-shell';
import { LoginForm } from '../_components/login-form';

export const metadata: Metadata = {
  title: 'Iniciar sesión · Folio',
};

type SearchParams = Promise<{ reset?: string; error?: string; next?: string }>;

const ERROR_MESSAGES: Record<string, string> = {
  oauth_failed: 'No pudimos completar el login con Google. Inténtalo de nuevo.',
  callback_failed: 'No pudimos validar tu sesión. Intenta iniciar sesión otra vez.',
  callback_missing_code: 'El enlace de confirmación no es válido o ya se usó.',
};

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const resetOk = params.reset === 'ok';
  const errorMessage = params.error ? ERROR_MESSAGES[params.error] : undefined;
  const next = typeof params.next === 'string' && params.next.startsWith('/') && !params.next.startsWith('//') ? params.next : undefined;

  return (
    <AuthShell
      title="Bienvenido"
      subtitle="Inicia sesión para continuar con tu portfolio."
      footer={
        <>
          ¿No tienes cuenta? <Link href="/signup">Crear cuenta</Link>
        </>
      }
    >
      {errorMessage && (
        <div className="auth-form__alert" role="alert" style={{ marginBottom: 16 }}>
          {errorMessage}
        </div>
      )}
      <LoginForm resetOk={resetOk} next={next} />
      <p className="auth-form__footer" style={{ marginTop: 0 }}>
        <Link href="/forgot-password">¿Olvidaste tu contraseña?</Link>
      </p>
    </AuthShell>
  );
}
