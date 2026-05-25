import { Icon } from '@/components/ui/icon';

export function QrPreview({ username }: { username: string }) {
  const qrUrl = `/api/card/${username}/qr?width=512`;
  const svgUrl = `/api/card/${username}/qr?format=svg`;
  return (
    <section
      style={{
        padding: '14px 22px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <div
        className="mono"
        style={{
          fontSize: 10,
          color: 'var(--text-faint)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        Scan or share
      </div>
      <div
        style={{
          width: 168,
          height: 168,
          padding: 12,
          background: '#ffffff',
          borderRadius: 'var(--r-md)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrUrl}
          width={144}
          height={144}
          alt={`Código QR de la card de ${username}`}
          style={{ display: 'block', width: 144, height: 144 }}
        />
      </div>
      <p
        style={{
          margin: 0,
          fontSize: 12.5,
          color: 'var(--text-dim)',
          maxWidth: 280,
          lineHeight: 1.45,
        }}
      >
        Apunta la cámara al código para abrir esta card en cualquier dispositivo.
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <a
          href={qrUrl}
          download={`folio-${username}-qr.png`}
          className="btn btn-secondary btn-sm"
          style={{ textDecoration: 'none' }}
        >
          <Icon name="download" size={12} /> PNG
        </a>
        <a
          href={svgUrl}
          download={`folio-${username}-qr.svg`}
          className="btn btn-secondary btn-sm"
          style={{ textDecoration: 'none' }}
        >
          <Icon name="download" size={12} /> SVG
        </a>
      </div>
    </section>
  );
}
