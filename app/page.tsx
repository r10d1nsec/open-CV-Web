import { SITE_DOMAIN } from '@/lib/site';
import Link from 'next/link';
import type { Metadata, Route } from 'next';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Pill } from '@/components/ui/pill';
import { Card } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Folio — tu portfolio profesional en una URL',
  description:
    'Crea gratis tu portfolio, tarjeta digital con QR, reservas y página de contacto. Open-source, self-host o Vercel.',
};

const DEMO = 'angel-roldan';

const FEATURES = [
  { icon: 'user' as const, title: 'Portfolio público', body: 'Tu experiencia, proyectos y skills en una página cuidada y personalizable.' },
  { icon: 'qr' as const, title: 'Tarjeta digital + QR', body: 'Comparte tu perfil con un QR para tarjetas NFC. Descarga tu vCard.' },
  { icon: 'mail' as const, title: 'Contacto directo', body: 'Un formulario protegido para que te escriban. Sin dar tu email a bots.' },
];

export default function HomePage() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Hero */}
      <section style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '88px 24px 56px' }}>
        <div style={{ maxWidth: 760, textAlign: 'center' }}>
          <Pill dot style={{ color: 'var(--accent)', marginBottom: 24 }}>
            Gratis para alumnos de empleabilidad
          </Pill>
          <h1 style={{ fontSize: 'clamp(40px, 7vw, 60px)', lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: 18 }}>
            Tu presencia profesional,
            <br />
            <span style={{ background: 'linear-gradient(90deg, var(--accent), #6366f1 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              en una sola URL.
            </span>
          </h1>
          <p style={{ fontSize: 17, color: 'var(--text-dim)', marginBottom: 32, lineHeight: 1.6, maxWidth: 560, marginInline: 'auto' }}>
            Portfolio, tarjeta digital con QR y contacto — listos en minutos. Tú escribes tu
            historia; nosotros la ponemos guapa y la servimos en tu propia dirección.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href={'/signup' as Route} style={{ textDecoration: 'none' }}>
              <Button size="lg" variant="primary">
                <Icon name="user" size={16} /> Crear mi perfil gratis
              </Button>
            </Link>
            <Link href={`/${DEMO}` as Route} style={{ textDecoration: 'none' }}>
              <Button size="lg" variant="secondary">
                <Icon name="eye" size={16} /> Ver un ejemplo
              </Button>
            </Link>
          </div>
          <p style={{ marginTop: 18, fontSize: 13.5, color: 'var(--text-dim)' }}>
            ¿Ya tienes cuenta?{' '}
            <Link href={'/login' as Route} style={{ color: 'var(--accent)' }}>
              Inicia sesión
            </Link>
          </p>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '8px 24px 56px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ maxWidth: 920, width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {FEATURES.map((f) => (
            <Card key={f.title} style={{ padding: 22 }}>
              <Icon name={f.icon} size={20} style={{ color: 'var(--accent)' }} />
              <h2 style={{ fontSize: 16, margin: '12px 0 6px', letterSpacing: '-0.01em' }}>{f.title}</h2>
              <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: 13.5, lineHeight: 1.55 }}>{f.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Demo strip */}
      <section style={{ padding: '0 24px 64px', display: 'flex', justifyContent: 'center' }}>
        <Card style={{ maxWidth: 920, width: '100%', padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ fontSize: 18, margin: '0 0 4px', letterSpacing: '-0.01em' }}>Mira cómo queda</h2>
            <p className="mono" style={{ margin: 0, fontSize: 12.5, color: 'var(--text-faint)' }}>
              {SITE_DOMAIN}/{DEMO}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link href={`/${DEMO}` as Route} style={{ textDecoration: 'none' }}>
              <Button variant="secondary" size="md"><Icon name="eye" size={15} /> Portfolio</Button>
            </Link>
            <Link href={`/c/${DEMO}` as Route} style={{ textDecoration: 'none' }}>
              <Button variant="ghost" size="md"><Icon name="qr" size={15} /> Tarjeta + QR</Button>
            </Link>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer style={{ marginTop: 'auto', padding: '24px', borderTop: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-faint)', fontSize: 12.5 }}>
        Folio · portfolio + tarjeta digital open-source ·{' '}
        <a href="https://github.com/r10d1nsec/open-CV-Web" style={{ color: 'var(--text-dim)' }} target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
      </footer>
    </main>
  );
}
