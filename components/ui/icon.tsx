import type { CSSProperties, ReactNode } from 'react';

export type IconName =
  | 'arrow'
  | 'arrowLeft'
  | 'arrowDown'
  | 'chevron'
  | 'chevDown'
  | 'plus'
  | 'check'
  | 'x'
  | 'download'
  | 'external'
  | 'calendar'
  | 'clock'
  | 'mail'
  | 'phone'
  | 'pin'
  | 'user'
  | 'grid'
  | 'layers'
  | 'inbox'
  | 'chart'
  | 'gear'
  | 'edit'
  | 'eye'
  | 'eyeOff'
  | 'bell'
  | 'search'
  | 'filter'
  | 'sun'
  | 'moon'
  | 'qr'
  | 'nfc'
  | 'link'
  | 'code'
  | 'github'
  | 'linkedin'
  | 'x_logo'
  | 'twitter'
  | 'globe'
  | 'rocket'
  | 'sparkle'
  | 'grip'
  | 'moreVert'
  | 'save'
  | 'drag'
  | 'play'
  | 'bookmark'
  | 'cardIcon'
  | 'target'
  | 'refresh'
  | 'copy'
  | 'figma'
  | 'palette';

const PATHS: Record<IconName, ReactNode> = {
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  arrowLeft: <path d="M19 12H5M11 6l-6 6 6 6" />,
  arrowDown: <path d="M12 5v14M6 13l6 6 6-6" />,
  chevron: <path d="M9 6l6 6-6 6" />,
  chevDown: <path d="M6 9l6 6 6-6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  check: <path d="M5 12l4.5 4.5L19 7" />,
  x: <path d="M6 6l12 12M18 6L6 18" />,
  download: <path d="M12 4v12m0 0l-5-5m5 5l5-5M5 20h14" />,
  external: <path d="M7 17L17 7M9 7h8v8" />,
  calendar: (
    <>
      <path d="M3 8h18M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
      <path d="M8 3v4M16 3v4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  mail: (
    <>
      <path d="M3 7l9 6 9-6" />
      <rect x="3" y="5" width="18" height="14" rx="2" />
    </>
  ),
  phone: <path d="M5 4h3l2 5-2.5 1.5a11 11 0 005 5L14 13l5 2v3a2 2 0 01-2 2A15 15 0 013 6a2 2 0 012-2z" />,
  pin: (
    <>
      <path d="M12 22s7-7.5 7-13a7 7 0 10-14 0c0 5.5 7 13 7 13z" />
      <circle cx="12" cy="9" r="2.5" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0116 0" />
    </>
  ),
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  layers: (
    <>
      <path d="M12 3l9 5-9 5-9-5 9-5z" />
      <path d="M3 13l9 5 9-5" />
      <path d="M3 18l9 5 9-5" />
    </>
  ),
  inbox: (
    <>
      <path d="M3 13l3-8h12l3 8v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5z" />
      <path d="M3 13h5l1 2h6l1-2h5" />
    </>
  ),
  chart: <path d="M4 19V5M4 19h16M8 15v-3M12 15V8M16 15v-6" />,
  gear: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 00.4 1.9l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.9-.4 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.9.4l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.4-1.9 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.4-1.9l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.9.4H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.9-.4l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.4 1.9V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" />
    </>
  ),
  edit: (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 113 3L7 19l-4 1 1-4L16.5 3.5z" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  eyeOff: (
    <>
      <path d="M3 3l18 18" />
      <path d="M10.6 5.1A10 10 0 0112 5c6 0 10 7 10 7a17 17 0 01-3.2 4.1M6.3 6.3A17 17 0 002 12s4 7 10 7a10 10 0 005.7-1.7" />
    </>
  ),
  bell: (
    <>
      <path d="M6 8a6 6 0 1112 0c0 7 3 7 3 9H3c0-2 3-2 3-9z" />
      <path d="M10 21a2 2 0 004 0" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </>
  ),
  filter: <path d="M3 5h18l-7 9v6l-4-2v-4L3 5z" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  moon: <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />,
  qr: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M14 14h3v3h-3zM18 18h3v3h-3zM14 19h2M19 14v2" />
    </>
  ),
  nfc: (
    <>
      <path d="M3 12a9 9 0 010-1" />
      <path d="M5 16a8 8 0 010-8" />
      <path d="M9 18a6 6 0 010-12" />
      <path d="M14 14a3 3 0 010-4" />
      <circle cx="18" cy="12" r="1.5" />
    </>
  ),
  link: (
    <>
      <path d="M10 14a5 5 0 007 0l3-3a5 5 0 00-7-7l-1 1" />
      <path d="M14 10a5 5 0 00-7 0l-3 3a5 5 0 007 7l1-1" />
    </>
  ),
  code: <path d="M8 6l-6 6 6 6M16 6l6 6-6 6M14 4l-4 16" />,
  github: <path d="M12 2a10 10 0 00-3.2 19.5c.5.1.7-.2.7-.5v-2c-2.8.6-3.4-1.2-3.4-1.2-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5a4 4 0 011-2.7c-.1-.3-.5-1.3.1-2.8 0 0 .8-.3 2.7 1a9.4 9.4 0 015 0c1.9-1.3 2.7-1 2.7-1 .6 1.5.2 2.5.1 2.8a4 4 0 011 2.7c0 4-2.4 4.7-4.6 5 .4.3.7.9.7 1.8v2.6c0 .3.2.6.7.5A10 10 0 0012 2z" />,
  linkedin: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M7 10v7M7 7v.01M11 17v-4a2 2 0 014 0v4M11 10v7" />
    </>
  ),
  x_logo: <path d="M4 4l16 16M20 4L4 20" />,
  twitter: <path d="M22 5.8a8 8 0 01-2.4.7 4 4 0 001.8-2.2 8 8 0 01-2.6 1 4 4 0 00-6.8 3.6A11.4 11.4 0 013 4.8a4 4 0 001.2 5.3 4 4 0 01-1.8-.5v.1a4 4 0 003.2 4 4 4 0 01-1.8.1 4 4 0 003.7 2.8A8 8 0 012 18.3a11.3 11.3 0 006.2 1.8c7.5 0 11.5-6.2 11.5-11.5v-.5A8 8 0 0022 5.8z" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
    </>
  ),
  rocket: (
    <>
      <path d="M14 4c4 0 6 2 6 6 0 5-7 11-7 11s-2-1-3-2M5 18c-1.5 1-3 3-3 3s2-.5 3-1m9-13a3 3 0 100 6 3 3 0 000-6z" />
      <path d="M7 16c-2 0-3 1-3 3s1 0 3 0M9 18c0 2 1 3 3 3s0-1 0-3" />
    </>
  ),
  sparkle: <path d="M12 3l1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16z" />,
  grip: <path d="M9 6h.01M9 12h.01M9 18h.01M15 6h.01M15 12h.01M15 18h.01" />,
  moreVert: <path d="M12 6h.01M12 12h.01M12 18h.01" />,
  save: (
    <>
      <path d="M5 3h11l3 3v15H5z" />
      <path d="M8 3v6h7V3M8 14h8" />
    </>
  ),
  drag: <path d="M4 8h16M4 16h16" />,
  play: <path d="M6 4l14 8-14 8V4z" />,
  bookmark: <path d="M6 3h12v18l-6-4-6 4V3z" />,
  cardIcon: (
    <>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <path d="M2 10h20M6 14h4" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </>
  ),
  refresh: <path d="M4 4v6h6M20 20v-6h-6M20 9a8 8 0 00-14-3l-2 4M4 15a8 8 0 0014 3l2-4" />,
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 012-2h10" />
    </>
  ),
  figma: (
    <>
      <circle cx="9" cy="12" r="3" />
      <path d="M9 3h3v6H9a3 3 0 010-6zM12 9h3a3 3 0 010 6h-3V9zM12 15h3v3a3 3 0 11-3-3zM9 15h3v6H9a3 3 0 010-6z" />
    </>
  ),
  palette: (
    <>
      <path d="M12 22a10 10 0 110-20c5 0 8 3.5 8 7 0 3-2.5 4-5 4h-1a2 2 0 00-1 3.5c.5.8 0 2-1 2z" />
      <circle cx="7.5" cy="11" r="1" fill="currentColor" />
      <circle cx="9.5" cy="6.5" r="1" fill="currentColor" />
      <circle cx="14.5" cy="6.5" r="1" fill="currentColor" />
      <circle cx="17" cy="11" r="1" fill="currentColor" />
    </>
  ),
};

export type IconProps = {
  name: IconName;
  size?: number;
  stroke?: number;
  className?: string;
  style?: CSSProperties;
  'aria-hidden'?: boolean;
};

export function Icon({ name, size = 18, stroke = 1.6, className, style, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden={rest['aria-hidden'] ?? true}
    >
      {PATHS[name]}
    </svg>
  );
}
