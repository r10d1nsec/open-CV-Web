import type { CSSProperties } from 'react';

export type AvatarProps = {
  size?: number;
  initials?: string;
  src?: string;
  ring?: boolean;
  hue?: number;
  className?: string;
  style?: CSSProperties;
};

export function Avatar({ size = 40, initials = '?', src, ring = false, hue = 220, className, style }: AvatarProps) {
  const composed: CSSProperties = {
    width: size,
    height: size,
    fontSize: size * 0.36,
    background: src
      ? `url(${src}) center/cover`
      : `linear-gradient(135deg, hsl(${hue} 80% 60%), hsl(${(hue + 60) % 360} 75% 50%))`,
    boxShadow: ring ? '0 0 0 3px var(--bg), 0 0 0 4.5px var(--accent)' : 'none',
    ...style,
  };
  return (
    <span className={`avatar${className ? ` ${className}` : ''}`} style={composed} aria-hidden={!src}>
      {!src && initials}
    </span>
  );
}
