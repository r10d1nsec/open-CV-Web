/**
 * Bandeja de leads — Sprint 9 (spec:015).
 *
 * Lista los mensajes recibidos vía el formulario de contacto del portfolio.
 * La RLS de `contact_messages` (0006) ya restringe el SELECT al owner del
 * perfil destinatario, así que un simple select devuelve solo los propios.
 *
 * Responder es un `mailto:` al sender (sin sistema de mensajería en v1).
 */
import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Metadata, Route } from 'next';
import { requireUser } from '@/lib/auth';
import { getCurrentProfile } from '@/lib/profile-store';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';

export const metadata: Metadata = { title: 'Mensajes · Folio' };
export const dynamic = 'force-dynamic';

type Lead = {
  id: string;
  sender_name: string;
  sender_email: string;
  message: string;
  created_at: string;
};

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default async function LeadsPage() {
  await requireUser('/dashboard/leads');
  const profile = await getCurrentProfile();
  if (!profile || !profile.onboardedAt) redirect('/onboarding');

  const supabase = await createClient();
  const { data } = await supabase
    .from('contact_messages')
    .select('id, sender_name, sender_email, message, created_at')
    .order('created_at', { ascending: false })
    .limit(100);
  const leads = (data ?? []) as Lead[];

  return (
    <main style={{ minHeight: '100dvh', padding: '32px 24px 64px', maxWidth: 760, marginInline: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <p className="mono" style={{ fontSize: 10.5, color: 'var(--text-faint)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
            Mensajes
          </p>
          <h1 style={{ fontSize: 28, margin: '4px 0 0', letterSpacing: '-0.02em' }}>
            Tu bandeja {leads.length > 0 && <span style={{ color: 'var(--text-faint)', fontSize: 18 }}>({leads.length})</span>}
          </h1>
        </div>
        <Link href={'/dashboard' as Route} style={{ fontSize: 13, color: 'var(--text-dim)', textDecoration: 'none' }}>
          ← Volver al dashboard
        </Link>
      </header>

      {leads.length === 0 ? (
        <Card style={{ padding: 32, textAlign: 'center' }}>
          <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: 14 }}>
            Aún no has recibido mensajes. Cuando alguien use tu formulario de contacto, aparecerá aquí.
          </p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {leads.map((lead) => (
            <Card key={lead.id} style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <span style={{ fontSize: 14.5, fontWeight: 500 }}>{lead.sender_name}</span>{' '}
                  <span className="mono" style={{ fontSize: 12, color: 'var(--text-faint)' }}>{lead.sender_email}</span>
                </div>
                <time className="mono" style={{ fontSize: 11.5, color: 'var(--text-faint)' }} dateTime={lead.created_at}>
                  {formatDate(lead.created_at)}
                </time>
              </div>
              <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: 13.5, whiteSpace: 'pre-wrap' }}>{lead.message}</p>
              <div>
                <a
                  href={`mailto:${lead.sender_email}?subject=${encodeURIComponent('Re: tu mensaje desde mi portfolio')}`}
                  className="btn btn-secondary btn-sm"
                  style={{ textDecoration: 'none' }}
                >
                  Responder por email
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
