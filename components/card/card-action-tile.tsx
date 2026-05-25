import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { Icon, type IconName } from '@/components/ui/icon';

export type CardActionTileProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  icon: IconName;
  label: string;
  sublabel?: string;
  primary?: boolean;
  color?: string;
  trailing?: ReactNode;
};

export function CardActionTile({
  icon,
  label,
  sublabel,
  primary = false,
  color,
  trailing,
  className,
  ...rest
}: CardActionTileProps) {
  return (
    <a
      {...rest}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '14px 16px',
        borderRadius: 'var(--r-md)',
        background: primary ? 'var(--accent)' : 'var(--surface)',
        border: primary ? '1px solid var(--accent)' : '1px solid var(--border)',
        color: primary ? 'white' : 'var(--text)',
        width: '100%',
        cursor: 'pointer',
        textDecoration: 'none',
        boxShadow: primary ? '0 8px 24px -10px var(--accent-glow)' : 'none',
        textAlign: 'left',
        fontFamily: 'var(--font-sans)',
        ...rest.style,
      }}
      className={className}
    >
      <div
        aria-hidden
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          flex: '0 0 auto',
          background: primary
            ? 'rgba(255,255,255,0.18)'
            : color
              ? `${color}22`
              : 'var(--surface-2)',
          color: primary ? 'white' : color || 'var(--accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={icon} size={18} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500 }}>{label}</div>
        {sublabel && (
          <div
            style={{
              fontSize: 11.5,
              color: primary ? 'rgba(255,255,255,0.7)' : 'var(--text-faint)',
              marginTop: 1,
            }}
          >
            {sublabel}
          </div>
        )}
      </div>
      {trailing ?? (
        <Icon
          name="chevron"
          size={14}
          style={{ color: primary ? 'rgba(255,255,255,0.6)' : 'var(--text-faint)' }}
        />
      )}
    </a>
  );
}
