'use client';

import { useActionState, useState, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useFormStatus } from 'react-dom';
import {
  uploadAvatar,
  type AvatarActionResult,
} from '@/app/(dashboard)/dashboard/edit/_actions/upload-avatar';
import { validateAvatarFile } from '@/lib/storage/avatar';

export function AvatarSection({ initial }: { initial: string | null }) {
  const [state, formAction] = useActionState<AvatarActionResult | null, FormData>(
    (prev, fd) => uploadAvatar(prev, fd),
    null,
  );
  const [preview, setPreview] = useState<string | null>(initial);
  const [clientError, setClientError] = useState<string | null>(null);

  function onPick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const valid = validateAvatarFile(file);
    if (!valid.ok) {
      setClientError(valid.error);
      setPreview(initial);
      e.target.value = '';
      return;
    }
    setClientError(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
  }

  const error = clientError ?? (state && !state.ok ? state.error : null);
  const justUploaded = state?.ok === true ? state.url : null;
  const displayUrl = justUploaded ?? preview;

  return (
    <Card style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <header>
        <h2 style={{ margin: 0, fontSize: 18, letterSpacing: '-0.01em' }}>Foto de perfil</h2>
        <p style={{ margin: '4px 0 0', color: 'var(--text-dim)', fontSize: 13 }}>
          PNG, JPG, WEBP o GIF · máximo 2 MB.
        </p>
      </header>

      <form action={formAction}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: '50%',
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {displayUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayUrl}
                alt="Vista previa del avatar"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span style={{ color: 'var(--text-faint)', fontSize: 12 }}>Sin foto</span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, minWidth: 220 }}>
            <input
              type="file"
              name="avatar"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={onPick}
              aria-label="Seleccionar imagen"
              style={{ fontSize: 13 }}
            />
            <AvatarFooter error={error} ok={state?.ok === true} />
          </div>
        </div>
      </form>
    </Card>
  );
}

function AvatarFooter({ error, ok }: { error: string | null; ok: boolean }) {
  const { pending } = useFormStatus();
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
      <output role="status" aria-live="polite" style={{ fontSize: 13 }}>
        {ok && <span style={{ color: 'var(--success)' }}>Foto actualizada ✓</span>}
        {error && (
          <span role="alert" style={{ color: 'var(--danger)' }}>
            {error}
          </span>
        )}
      </output>
      <Button
        type="submit"
        variant="primary"
        size="md"
        disabled={pending}
        aria-busy={pending || undefined}
      >
        {pending ? 'Subiendo…' : 'Subir foto'}
      </Button>
    </div>
  );
}
