'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { sendContact, type ContactActionResult } from '@/app/(public)/[username]/contact/_actions/send-contact';

export function ContactForm({ username, displayName }: { username: string; displayName: string }) {
  const [state, formAction] = useActionState<ContactActionResult | null, FormData>(
    (prev, fd) => sendContact(username, prev, fd),
    null,
  );
  const [message, setMessage] = useState('');
  const fe = state && !state.ok ? state.fieldErrors : undefined;

  if (state?.ok === true) {
    return (
      <div
        role="status"
        style={{
          padding: 32,
          background: 'color-mix(in oklab, var(--success) 14%, transparent)',
          border: '1px solid color-mix(in oklab, var(--success) 35%, transparent)',
          borderRadius: 'var(--r-md)',
          textAlign: 'center',
        }}
      >
        <h2 style={{ margin: '0 0 8px', fontSize: 18 }}>Mensaje enviado ✓</h2>
        <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: 14 }}>
          {displayName} lo recibirá en su email. Te responderá lo antes posible.
        </p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      noValidate
      style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
    >
      {/* Honeypot: invisible para humanos, atractivo para bots. */}
      <div aria-hidden style={{ position: 'absolute', left: '-9999px' }}>
        <label>
          Company (no rellenar)
          <input type="text" name="honeypot" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <Field label="Tu nombre" htmlFor="name" error={fe?.name}>
        <Input
          id="name"
          name="name"
          required
          maxLength={80}
          autoComplete="name"
          placeholder="ej. Ana Martínez"
        />
      </Field>

      <Field label="Tu email" htmlFor="email" error={fe?.email}>
        <Input
          id="email"
          name="email"
          type="email"
          required
          maxLength={120}
          autoComplete="email"
          placeholder="ana@example.com"
        />
      </Field>

      <Field
        label="Mensaje"
        htmlFor="message"
        hint={`${message.length} / 2000`}
        error={fe?.message}
      >
        <Textarea
          id="message"
          name="message"
          rows={6}
          minLength={10}
          maxLength={2000}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={`Hola ${displayName}, vi tu portfolio y…`}
        />
      </Field>

      <Footer state={state} />
    </form>
  );
}

function Footer({ state }: { state: ContactActionResult | null }) {
  const { pending } = useFormStatus();
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
      <output role="status" aria-live="polite" style={{ fontSize: 13 }}>
        {state?.ok === false && (
          <span role="alert" style={{ color: 'var(--danger)' }}>
            {state.error}
          </span>
        )}
      </output>
      <Button type="submit" variant="primary" size="md" disabled={pending} aria-busy={pending || undefined}>
        {pending ? 'Enviando…' : 'Enviar mensaje'}
      </Button>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label htmlFor={htmlFor} style={{ fontSize: 13, color: 'var(--text-dim)' }}>
        {label}
      </label>
      {children}
      {hint && !error && (
        <p style={{ margin: 0, fontSize: 11.5, color: 'var(--text-faint)' }}>{hint}</p>
      )}
      {error && (
        <p role="alert" style={{ margin: 0, fontSize: 12, color: 'var(--danger)' }}>
          {error}
        </p>
      )}
    </div>
  );
}
