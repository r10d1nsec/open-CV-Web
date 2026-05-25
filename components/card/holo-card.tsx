import type { Profile } from '@/types/profile';

const YEAR = new Date().getFullYear();

export function HoloCard({ profile, tilt = -6 }: { profile: Profile; tilt?: number }) {
  return (
    <div style={{ perspective: 1400, width: 300, marginInline: 'auto' }}>
      <div
        style={{
          position: 'relative',
          aspectRatio: '1.586',
          borderRadius: 18,
          transform: `rotateX(${tilt * -0.3}deg) rotateY(${tilt}deg)`,
          transformStyle: 'preserve-3d',
          boxShadow:
            '0 1px 0 rgba(255,255,255,0.4) inset, 0 -1px 0 rgba(0,0,0,0.5) inset, 0 30px 60px -20px rgba(0,0,0,0.6), 0 18px 30px -18px rgba(120,119,198,0.4)',
          overflow: 'hidden',
        }}
      >
        <div className="holo" aria-hidden style={{ position: 'absolute', inset: 0 }} />
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(100% 60% at 50% 0%, rgba(255,255,255,0.55), transparent 60%), radial-gradient(60% 80% at 100% 100%, rgba(255,255,255,0.3), transparent 60%)',
            mixBlendMode: 'overlay',
          }}
        />
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'repeating-linear-gradient(115deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 4px)',
            opacity: 0.6,
            mixBlendMode: 'overlay',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 1.5,
            borderRadius: 16.5,
            background:
              'linear-gradient(155deg, rgba(8,10,15,0.78) 0%, rgba(8,10,15,0.85) 60%, rgba(20,18,40,0.55) 100%)',
            backdropFilter: 'blur(2px)',
            padding: '18px 18px 16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            color: '#fff',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.04) inset',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden>
                <rect
                  x="1"
                  y="1"
                  width="20"
                  height="20"
                  rx="5"
                  fill="none"
                  stroke="rgba(255,255,255,0.85)"
                  strokeWidth="1.2"
                />
                <path
                  d="M7 6h8M7 11h5M7 16h3"
                  stroke="rgba(255,255,255,0.9)"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
              <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.18em', opacity: 0.85 }}>
                FOLIO
              </span>
            </div>
            <div
              aria-hidden
              style={{
                width: 30,
                height: 22,
                borderRadius: 4,
                background: 'linear-gradient(135deg, #d4af37 0%, #f5e8a7 50%, #b8860b 100%)',
                position: 'relative',
                boxShadow: '0 1px 0 rgba(255,255,255,0.4) inset',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 3,
                  borderRadius: 2,
                  background:
                    'repeating-linear-gradient(90deg, transparent 0 3px, rgba(0,0,0,0.3) 3px 4px), repeating-linear-gradient(0deg, transparent 0 3px, rgba(0,0,0,0.3) 3px 4px)',
                }}
              />
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: 11,
                opacity: 0.7,
                letterSpacing: '0.05em',
                fontFamily: 'var(--font-mono)',
              }}
            >
              MEMBER · {YEAR}
            </div>
            <div style={{ fontSize: 19, fontWeight: 600, marginTop: 4, letterSpacing: '-0.015em' }}>
              {profile.name}
            </div>
            <div style={{ fontSize: 11, opacity: 0.75, marginTop: 2 }}>
              {profile.title.split('&')[0]?.trim() ?? profile.title} · {profile.location}
            </div>
          </div>
        </div>
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)',
          }}
        />
      </div>
    </div>
  );
}
