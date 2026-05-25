'use client';

/**
 * Digital Card v2 — mobile-first, animada, personalizable (spec:005 v2).
 * Port de la maqueta de Claude Design (animaciones CSS, 0 dependencias).
 * Recibe datos ya resueltos desde el server component `c/[username]/page.tsx`.
 */
import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import type { CardLink, CardStyle } from '@/types/profile';

export type CardData = {
  name: string;
  initials: string;
  title: string;
  company?: string;
  location: string;
  available: boolean;
  availableLine?: string;
  avatarUrl?: string;
  cardStyle: CardStyle;
  cardCoverUrl?: string;
  username: string;
  vcardUrl: string;
  qrPngUrl: string;
  qrSvgUrl: string;
  cardUrl: string;
  bookingUrl: string;
  contactUrl: string;
  cvUrl?: string;
  waUrl?: string;
  telUrl?: string;
  smsUrl?: string;
  mailUrl?: string;
  links: CardLink[];
  socials: { icon: string; url: string }[];
};

const MOTION_CSS = `
@keyframes dcv2-rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes dcv2-pop{0%{opacity:0;transform:scale(.88)}60%{opacity:1}100%{transform:scale(1)}}
@keyframes dcv2-glow{0%,100%{opacity:.55;transform:translate(0,0) scale(1)}50%{opacity:.85;transform:translate(2%,-3%) scale(1.08)}}
@keyframes dcv2-drift{0%{transform:translate(-4%,-2%) rotate(0)}50%{transform:translate(4%,3%) rotate(8deg)}100%{transform:translate(-4%,-2%) rotate(0)}}
@keyframes dcv2-shine{0%{transform:translateX(-120%)}100%{transform:translateX(220%)}}
@keyframes dcv2-pulse{0%,100%{box-shadow:0 0 24px var(--accent-glow),0 0 0 4px var(--bg)}50%{box-shadow:0 0 34px var(--accent-glow),0 0 0 4px var(--bg)}}
@keyframes dcv2-fadein{from{opacity:0}to{opacity:1}}
.dcv2-stage [data-rise]{animation:dcv2-rise .55s cubic-bezier(.2,.7,.2,1) both}
.dcv2-stage [data-rise="0"]{animation-delay:0ms}.dcv2-stage [data-rise="1"]{animation-delay:70ms}
.dcv2-stage [data-rise="2"]{animation-delay:140ms}.dcv2-stage [data-rise="3"]{animation-delay:210ms}
.dcv2-stage [data-rise="4"]{animation-delay:280ms}.dcv2-stage [data-rise="5"]{animation-delay:350ms}
.dcv2-stage [data-rise="6"]{animation-delay:420ms}.dcv2-stage [data-rise="7"]{animation-delay:490ms}
.dcv2-stage [data-rise="8"]{animation-delay:560ms}
.dcv2-stage [data-pop]{animation:dcv2-pop .6s cubic-bezier(.2,.9,.2,1.2) both;animation-delay:120ms}
.dcv2-stage .dcv2-glow-a{animation:dcv2-glow 7s ease-in-out infinite}
.dcv2-stage .dcv2-glow-b{animation:dcv2-drift 11s ease-in-out infinite}
.dcv2-stage .dcv2-shine{animation:dcv2-shine 2.8s ease-out 1s both}
.dcv2-stage .dcv2-avatar-ring{animation:dcv2-pulse 3.4s ease-in-out infinite}
.dcv2-tap{transition:transform .12s ease,box-shadow .18s ease,border-color .18s ease,background .18s ease;text-decoration:none}
.dcv2-tap:active{transform:scale(.97)}
.dcv2-link:hover{border-color:rgba(var(--accent-rgb),.55);background:var(--accent-soft)}
.dcv2-link:hover .dcv2-chev{transform:translateX(3px);color:var(--accent)}
.dcv2-chev{transition:transform .18s ease,color .18s ease}
@media (prefers-reduced-motion:reduce){
 .dcv2-stage [data-rise],.dcv2-stage [data-pop]{animation:dcv2-fadein .25s both!important;animation-delay:0!important}
 .dcv2-stage .dcv2-glow-a,.dcv2-stage .dcv2-glow-b,.dcv2-stage .dcv2-shine,.dcv2-stage .dcv2-avatar-ring{animation:none!important}
}`;

function BrandIcon({ name, size = 18 }: { name: string; size?: number }) {
  const p: Record<string, React.ReactNode> = {
    web: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" /></>,
    link: <><path d="M10 14a5 5 0 007 0l3-3a5 5 0 00-7-7l-1 1" /><path d="M14 10a5 5 0 00-7 0l-3 3a5 5 0 007 7l1-1" /></>,
    calendar: <><path d="M3 8h18M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" /><path d="M8 3v4M16 3v4" /></>,
    doc: <><path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9z" /><path d="M14 3v6h6M8 13h8M8 17h5" /></>,
    shop: <><path d="M3 7h18l-2 12a2 2 0 01-2 1.7H7a2 2 0 01-2-1.7L3 7z" /><path d="M8 7V5a4 4 0 018 0v2" /></>,
    pay: <><rect x="2" y="6" width="20" height="12" rx="2" /><path d="M2 10h20M6 14h4" /></>,
    chat: <path d="M21 12c0 4.5-4 8-9 8a10 10 0 01-3.6-.7L3 21l1.4-4.5A8 8 0 0112 4c5 0 9 3.5 9 8z" />,
    video: <><rect x="3" y="6" width="13" height="12" rx="2" /><path d="M16 10l5-3v10l-5-3" /></>,
    music: <><circle cx="6" cy="18" r="2.5" /><circle cx="18" cy="16" r="2.5" /><path d="M8.5 18V6l12-2v12" /></>,
    map: <><path d="M9 3l-6 3v15l6-3 6 3 6-3V3l-6 3-6-3z" /><path d="M9 3v15M15 6v15" /></>,
    telegram: <path d="M3 12l18-7-3 16-7-4-4 4v-5l11-9-13 7-2-2z" />,
    whatsapp: <><path d="M21 11.5a8.4 8.4 0 01-12.7 7.3L3 21l2.3-5.1A8.4 8.4 0 1121 11.5z" /><path d="M9 9c.6-.3 1.2-.3 1.6.2.4.6 1 1.5 1.5 2-.2.6-.8.8-1.2 1 .6 1 1.4 1.8 2.5 2.3.3-.3.7-.8 1.1-1 .6.4 1.5 1 2 1.4.6.4.6 1 .2 1.6-.8 1-2 1.5-3.3 1A8 8 0 019 9z" /></>,
    phone: <path d="M5 4h3l2 5-2.5 1.5a11 11 0 005 5L14 13l5 2v3a2 2 0 01-2 2A15 15 0 013 6a2 2 0 012-2z" />,
    mail: <><path d="M3 7l9 6 9-6" /><rect x="3" y="5" width="18" height="14" rx="2" /></>,
    pin: <><path d="M12 22s7-7.5 7-13a7 7 0 10-14 0c0 5.5 7 13 7 13z" /><circle cx="12" cy="9" r="2.5" /></>,
    download: <path d="M12 4v12m0 0l-5-5m5 5l5-5M5 20h14" />,
    chevron: <path d="M9 6l6 6-6 6" />,
    arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0116 0" /></>,
    linkedin: <><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M7 10v7M7 7v.01M11 17v-4a2 2 0 014 0v4M11 10v7" /></>,
    github: <path d="M12 2a10 10 0 00-3.2 19.5c.5.1.7-.2.7-.5v-2c-2.8.6-3.4-1.2-3.4-1.2-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5a4 4 0 011-2.7c-.1-.3-.5-1.3.1-2.8 0 0 .8-.3 2.7 1a9.4 9.4 0 015 0c1.9-1.3 2.7-1 2.7-1 .6 1.5.2 2.5.1 2.8a4 4 0 011 2.7c0 4-2.4 4.7-4.6 5 .4.3.7.9.7 1.8v2.6c0 .3.2.6.7.5A10 10 0 0012 2z" />,
    instagram: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" /></>,
    x: <path d="M4 4l16 16M20 4L4 20" />,
    figma: <><circle cx="9" cy="12" r="3" /><path d="M9 3h3v6H9a3 3 0 010-6zM12 9h3a3 3 0 010 6h-3V9zM12 15h3v3a3 3 0 11-3-3zM9 15h3v6H9a3 3 0 010-6z" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {p[name] ?? p.link}
    </svg>
  );
}

function Cover({ style, cover }: { style: CardStyle; cover?: string }) {
  if (cover) {
    return (
      <div style={{ position: 'relative', height: 200, width: '100%', overflow: 'hidden', background: `url(${cover}) center/cover` }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 45%, var(--bg) 100%)' }} />
      </div>
    );
  }
  if (style === 'minimal') {
    return (
      <div style={{ position: 'relative', height: 150, width: '100%', overflow: 'hidden', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ position: 'absolute', top: 0, left: 24, right: 24, height: 3, background: 'linear-gradient(90deg, transparent, var(--accent), transparent)', opacity: 0.7 }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(var(--border-strong) 1px, transparent 1px)', backgroundSize: '18px 18px', opacity: 0.35 }} />
      </div>
    );
  }
  if (style === 'mesh') {
    return (
      <div style={{ position: 'relative', height: 200, width: '100%', overflow: 'hidden', background: '#06080c' }}>
        <div className="dcv2-glow-b" style={{ position: 'absolute', inset: '-30%', background: 'conic-gradient(from 210deg at 60% 40%, color-mix(in oklab, var(--accent) 50%, #6ee7ff) 0deg, #c084fc 80deg, #fb7185 130deg, #fbbf24 180deg, #34d399 230deg, color-mix(in oklab, var(--accent) 60%, #38bdf8) 290deg, #818cf8 340deg, color-mix(in oklab, var(--accent) 50%, #6ee7ff) 360deg)', filter: 'blur(40px) saturate(1.1)', opacity: 0.55 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 60% at 50% 0%, transparent 0%, rgba(0,0,0,.5) 70%), linear-gradient(180deg, transparent 60%, var(--bg) 100%)' }} />
      </div>
    );
  }
  // aurora
  return (
    <div style={{ position: 'relative', height: 200, width: '100%', overflow: 'hidden', background: 'linear-gradient(180deg, color-mix(in oklab, var(--accent) 22%, var(--bg)) 0%, var(--bg) 100%)' }}>
      <div className="dcv2-glow-a" style={{ position: 'absolute', inset: '-20% -10% auto -10%', height: '120%', background: 'radial-gradient(60% 70% at 30% 30%, var(--accent) 0%, transparent 60%)', filter: 'blur(40px)', opacity: 0.65 }} />
      <div className="dcv2-glow-b" style={{ position: 'absolute', right: '-20%', top: '-20%', width: '90%', height: '120%', background: 'radial-gradient(50% 50% at 60% 40%, color-mix(in oklab, var(--accent) 80%, #8b5cf6) 0%, transparent 65%)', filter: 'blur(50px)', opacity: 0.55 }} />
      <div className="dcv2-shine" style={{ position: 'absolute', top: 0, left: 0, width: '60%', height: '100%', background: 'linear-gradient(100deg, transparent 35%, rgba(255,255,255,.15) 50%, transparent 65%)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 55%, var(--bg) 100%)' }} />
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: '0 22px', marginBottom: 10 }}>
      <span className="mono" style={{ fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-faint)' }}>{children}</span>
    </div>
  );
}

function Chip({ icon, label, href, brand, primary }: { icon: string; label: string; href: string; brand?: 'wa'; primary?: boolean }) {
  const bg = brand === 'wa' ? '#25d366' : primary ? 'var(--accent)' : 'var(--surface)';
  const fg = brand === 'wa' || primary ? 'white' : 'var(--text)';
  const bd = brand === 'wa' ? '#1ebc59' : primary ? 'var(--accent)' : 'var(--border)';
  return (
    <a className="dcv2-tap" href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
      style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, padding: '12px 10px', minWidth: 78, height: 76, background: bg, color: fg, border: `1px solid ${bd}`, borderRadius: 16, boxShadow: brand === 'wa' ? '0 8px 20px -8px rgba(37,211,102,.5)' : primary ? '0 8px 20px -8px var(--accent-glow)' : 'none' }}>
      <div style={{ width: 30, height: 30, borderRadius: 10, background: brand === 'wa' || primary ? 'rgba(255,255,255,.18)' : 'var(--surface-2)', color: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <BrandIcon name={icon} size={17} />
      </div>
      <span style={{ fontSize: 11.5, fontWeight: 500 }}>{label}</span>
    </a>
  );
}

function cleanUrl(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

export function DigitalCard({ data }: { data: CardData }) {
  const accentVars = { '--accent': '', } as CSSProperties; // theme vars vienen del wrapper de page.tsx
  void accentVars;

  const chips = useMemo(() => {
    const out: { icon: string; label: string; href: string; brand?: 'wa'; primary?: boolean }[] = [];
    if (data.waUrl) out.push({ icon: 'whatsapp', label: 'WhatsApp', href: data.waUrl, brand: 'wa' });
    if (data.telUrl) out.push({ icon: 'phone', label: 'Llamar', href: data.telUrl });
    if (data.smsUrl) out.push({ icon: 'chat', label: 'SMS', href: data.smsUrl });
    if (data.mailUrl) out.push({ icon: 'mail', label: 'Email', href: data.mailUrl });
    out.push({ icon: 'calendar', label: 'Reservar', href: data.bookingUrl });
    out.push({ icon: 'web', label: 'Portfolio', href: `/${data.username}` });
    return out;
  }, [data]);

  async function share() {
    const shareData = { title: `${data.name} · Folio`, url: data.cardUrl };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(data.cardUrl);
        alert('Enlace copiado');
      }
    } catch {
      /* cancelado */
    }
  }

  return (
    <main className="dcv2-stage" style={{ maxWidth: 440, margin: '0 auto', minHeight: '100dvh', position: 'relative', overflow: 'hidden' }}>
      <style dangerouslySetInnerHTML={{ __html: MOTION_CSS }} />

      {/* COVER + avatar */}
      <div style={{ position: 'relative' }} data-rise="0">
        <Cover style={data.cardStyle} cover={data.cardCoverUrl} />
        <div style={{ position: 'absolute', left: '50%', bottom: -48, transform: 'translateX(-50%)' }} data-pop>
          <div style={{ position: 'relative', width: 96, height: 96 }}>
            <div className="dcv2-avatar-ring" style={{ position: 'absolute', inset: -5, borderRadius: '50%', border: '2.5px solid var(--accent)' }} />
            <div style={{ width: 96, height: 96, borderRadius: '50%', background: data.avatarUrl ? `url(${data.avatarUrl}) center/cover` : 'linear-gradient(135deg, color-mix(in oklab, var(--accent) 70%, #8b5cf6), color-mix(in oklab, var(--accent) 30%, #f43f5e))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 32, fontWeight: 600, boxShadow: '0 12px 28px rgba(0,0,0,.35)', overflow: 'hidden' }}>
              {!data.avatarUrl && data.initials}
            </div>
            {data.available && (
              <div style={{ position: 'absolute', right: 2, bottom: 4, width: 18, height: 18, borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 0 3px var(--bg), 0 0 12px rgba(34,197,94,.6)' }} />
            )}
          </div>
        </div>
      </div>

      <div style={{ paddingTop: 60, paddingBottom: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* identity */}
        <div data-rise="1" style={{ textAlign: 'center', padding: '0 24px' }}>
          <h1 style={{ fontSize: 24, margin: 0, letterSpacing: '-0.02em', fontWeight: 700 }}>{data.name}</h1>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.45 }}>{data.title}</p>
          {data.company && <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text)' }}>{data.company}</p>}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginTop: 10, padding: '5px 12px', borderRadius: 999, background: 'var(--surface)', border: '1px solid var(--border)', fontSize: 12 }}>
            <BrandIcon name="pin" size={12} />
            <span style={{ color: 'var(--text-dim)' }}>{data.location}</span>
            {data.available && (
              <>
                <span style={{ width: 1, height: 12, background: 'var(--border)' }} />
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--success)', fontWeight: 500 }}>
                  <span className="dot dot-green" style={{ width: 7, height: 7 }} />
                  {data.availableLine ?? 'Disponible'}
                </span>
              </>
            )}
          </div>
        </div>

        {/* primary CTA */}
        <div data-rise="2" style={{ padding: '0 22px' }}>
          <a className="dcv2-tap" href={data.vcardUrl} download style={{ width: '100%', height: 56, borderRadius: 16, position: 'relative', overflow: 'hidden', background: 'linear-gradient(180deg, var(--accent) 0%, color-mix(in oklab, var(--accent) 80%, #000) 100%)', color: 'white', fontWeight: 600, fontSize: 15.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 1px 0 rgba(255,255,255,.25) inset, 0 12px 30px -8px var(--accent-glow)' }}>
            <BrandIcon name="download" size={18} />
            <span>Guardar contacto</span>
          </a>
        </div>

        {/* quick chips */}
        <div data-rise="3">
          <div style={{ display: 'flex', gap: 10, padding: '0 22px', overflowX: 'auto', scrollbarWidth: 'none' }}>
            {chips.map((c) => <Chip key={c.label} {...c} />)}
          </div>
        </div>

        {/* custom links */}
        {data.links.length > 0 && (
          <div data-rise="4">
            <SectionLabel>Enlaces</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 22px' }}>
              {data.links.map((l, i) => (
                <a key={i} className="dcv2-tap dcv2-link" href={l.url} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, color: 'var(--text)' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 11, flex: '0 0 auto', background: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BrandIcon name={l.icon} size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{l.label}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-faint)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cleanUrl(l.url)}</div>
                  </div>
                  <span className="dcv2-chev" style={{ color: 'var(--text-faint)' }}><BrandIcon name="chevron" size={16} /></span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* socials */}
        {data.socials.length > 0 && (
          <div data-rise="5">
            <SectionLabel>Redes</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8, padding: '0 22px' }}>
              {data.socials.map((s, i) => (
                <a key={i} className="dcv2-tap" href={s.url} target="_blank" rel="noopener noreferrer"
                  style={{ aspectRatio: '1', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BrandIcon name={s.icon} size={18} />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* CV */}
        {data.cvUrl && (
          <div data-rise="6" style={{ padding: '0 22px' }}>
            <a className="dcv2-tap" href={data.cvUrl} target="_blank" rel="noopener noreferrer"
              style={{ width: '100%', height: 48, borderRadius: 12, background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 14, fontWeight: 500 }}>
              <span style={{ color: 'var(--accent)' }}><BrandIcon name="download" size={15} /></span> Descargar CV
            </a>
          </div>
        )}

        {/* lead capture */}
        <div data-rise="7" style={{ padding: '0 22px' }}>
          <a className="dcv2-tap" href={data.contactUrl}
            style={{ width: '100%', padding: '16px', background: 'linear-gradient(180deg, var(--surface) 0%, var(--surface-2) 100%)', border: '1px dashed var(--border-strong)', borderRadius: 14, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, flex: '0 0 auto', background: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BrandIcon name="user" size={18} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Déjame tus datos</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-faint)', marginTop: 2 }}>Y te escribo lo antes posible</div>
            </div>
            <span className="dcv2-chev" style={{ color: 'var(--accent)' }}><BrandIcon name="arrow" size={16} /></span>
          </a>
        </div>

        {/* QR + share */}
        <div data-rise="8">
          <SectionLabel>Compartir</SectionLabel>
          <div className="card" style={{ margin: '0 22px', padding: 18, borderRadius: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={data.qrPngUrl} alt={`Código QR de ${data.name}`} width={156} height={156} style={{ width: 156, height: 156, borderRadius: 16, background: '#fff', padding: 8 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
              <button type="button" onClick={share} className="dcv2-tap" style={{ height: 46, borderRadius: 12, cursor: 'pointer', background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontWeight: 500, fontSize: 14 }}>
                <BrandIcon name="link" size={16} /> Compartir
              </button>
              <div style={{ display: 'flex', gap: 8 }}>
                <a className="dcv2-tap" href={`${data.qrPngUrl}`} download={`folio-qr-${data.username}.png`} style={{ flex: 1, height: 40, borderRadius: 10, background: 'var(--surface-2)', color: 'var(--text-dim)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13 }}>
                  <BrandIcon name="download" size={14} /> PNG
                </a>
                <a className="dcv2-tap" href={data.qrSvgUrl} download={`folio-qr-${data.username}.svg`} style={{ flex: 1, height: 40, borderRadius: 10, background: 'var(--surface-2)', color: 'var(--text-dim)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13 }}>
                  <BrandIcon name="download" size={14} /> SVG
                </a>
              </div>
            </div>
            <span className="mono" style={{ fontSize: 10.5, color: 'var(--text-faint)' }}>{cleanUrl(data.cardUrl)}</span>
          </div>
        </div>

        {/* footer */}
        <div data-rise="8" style={{ padding: '14px 24px 4px', textAlign: 'center' }}>
          <Link href="/" className="mono" style={{ fontSize: 11, color: 'var(--text-faint)', textDecoration: 'none' }}>
            Hecho con <span style={{ color: 'var(--accent)' }}>Folio</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
