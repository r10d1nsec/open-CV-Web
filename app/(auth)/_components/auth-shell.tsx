import Link from 'next/link';
import type { ReactNode } from 'react';

import { Icon } from '@/components/ui/icon';

export type AuthShellProps = {
  children: ReactNode;
  title: string;
  subtitle?: string;
  footer?: ReactNode;
};

export function AuthShell({ children, title, subtitle, footer }: AuthShellProps) {
  return (
    <div className="auth-shell fol">
      <aside className="auth-shell__brand" aria-hidden="true">
        <Link href="/" className="auth-shell__logo">
          <span className="auth-shell__logo-dot" aria-hidden="true" />
          Folio
        </Link>
        <div className="auth-shell__brand-quote">
          <h2>Tu portfolio, tu tarjeta digital y tu agenda — en un único link.</h2>
          <p>
            Crea tu presencia profesional en minutos. Conecta tu calendario y deja que tus
            clientes reserven directamente.
          </p>
        </div>
        <div className="auth-shell__brand-footer">
          <Icon name="sparkle" size={14} />
          <span>Sub-sprint 3a · Folio MVP</span>
        </div>
      </aside>
      <main className="auth-shell__main">
        <div className="auth-shell__inner">
          <Link
            href="/"
            className="auth-shell__logo"
            style={{ alignSelf: 'flex-start' }}
            aria-label="Volver a inicio"
          >
            <span className="auth-shell__logo-dot" aria-hidden="true" />
            Folio
          </Link>
          <div className="auth-heading">
            <h1>{title}</h1>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          {children}
          {footer ? <p className="auth-form__footer">{footer}</p> : null}
        </div>
      </main>
    </div>
  );
}
