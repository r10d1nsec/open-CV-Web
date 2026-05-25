/**
 * Domain types — Profile + portfolio.
 * Source of truth derived from master.md §6 and the design's data.jsx (Maya persona).
 * Will align with Supabase schema in Sprint 3.
 */

export type SocialKind = 'github' | 'linkedin' | 'twitter' | 'figma' | 'read' | 'website' | 'custom';

export type CardStyle = 'aurora' | 'minimal' | 'mesh';

export type CardLinkIcon =
  | 'web' | 'link' | 'calendar' | 'doc' | 'shop' | 'pay'
  | 'chat' | 'video' | 'music' | 'map' | 'telegram' | 'whatsapp';

export type CardLink = {
  icon: CardLinkIcon;
  label: string;
  url: string;
};

export type FontFamily = 'plus-jakarta' | 'inter' | 'tiempos';
export type LayoutVariant = 'default' | 'sidebar' | 'minimal';
export type SectionKey =
  | 'hero'
  | 'skills'
  | 'experience'
  | 'projects'
  | 'testimonials'
  | 'services'
  | 'contact';

export const DEFAULT_SECTION_ORDER: readonly SectionKey[] = [
  'hero',
  'skills',
  'experience',
  'projects',
  'testimonials',
  'services',
  'contact',
];

export type SocialLink = {
  kind: SocialKind;
  handle: string;
  url?: string;
  label?: string;
};

export type SkillGroup = Record<string, readonly string[]>;

export type ExperienceItem = {
  role: string;
  org: string;
  period: string;
  blurb: string;
  current?: boolean;
};

export type Project = {
  title: string;
  tag: string;
  blurb: string;
  stack: readonly string[];
  color: string;
  githubUrl?: string;
  liveUrl?: string;
  highlight?: boolean;
  imageUrl?: string;
};

export type Service = {
  id: string;
  name: string;
  /** minutes if number, free string for non-time-bound packages (e.g. "5d") */
  duration: number | string;
  price: string;
  blurb: string;
  popular?: boolean;
};

export type Testimonial = {
  quote: string;
  author: string;
  org: string;
};

export type Profile = {
  name: string;
  initials: string;
  username: string;
  title: string;
  bio: string;
  location: string;
  available: boolean;
  availableLine?: string;
  languages: readonly string[];
  hourly?: string;
  email: string;
  phone?: string;
  website?: string;
  cvUrl?: string;
  avatarUrl?: string;
  social: Partial<Record<SocialKind, string>>;
  skills: SkillGroup;
  experience: readonly ExperienceItem[];
  projects: readonly Project[];
  services: readonly Service[];
  testimonials?: readonly Testimonial[];
  /** Timestamp ISO; undefined si todavía no ha completado el onboarding wizard (spec:011). */
  onboardedAt?: string;
  /** Personalización visual (spec:014). */
  accentColor: string;
  coverImageUrl?: string;
  fontFamily: FontFamily;
  layoutVariant: LayoutVariant;
  sectionOrder: readonly SectionKey[];
  sectionHidden: readonly SectionKey[];
  /** Digital card (spec:005 v2). */
  company?: string;
  whatsapp?: string;
  whatsappMessage?: string;
  cardStyle: CardStyle;
  cardCoverUrl?: string;
  cardLinks: readonly CardLink[];
};
