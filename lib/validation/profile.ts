/**
 * Zod schemas for the profile editor (Sprint 4 S4.6).
 *
 * Sections:
 *   - Identity (name, title, location, languages, hourly, available, availableLine)
 *   - Bio
 *   - Social (handle por kind)
 *   - Skills (grupos con items)
 *
 * Cada schema acepta FormData-like input: strings que llegan crudos del form
 * son trimeados, los opcionales vacíos pasan a `undefined`, `available` se
 * coerce desde `'on'`/`undefined`/booleano.
 *
 * Refs: spec:002 §Non-functional, types/profile.ts.
 */
import { z } from 'zod';
import type { Profile, SocialKind } from '@/types/profile';

const trimmedString = (max: number) =>
  z
    .string()
    .transform((s) => s.trim())
    .pipe(z.string().min(1).max(max));

const optionalTrimmed = (max: number) =>
  z.preprocess(
    (v) => {
      if (typeof v !== 'string') return undefined;
      const t = v.trim();
      return t.length === 0 ? undefined : t;
    },
    z.string().max(max).optional(),
  );

const checkboxBool = z
  .union([z.boolean(), z.string(), z.undefined(), z.null()])
  .transform((v) => {
    if (typeof v === 'boolean') return v;
    if (v === 'on' || v === 'true') return true;
    return false;
  })
  .pipe(z.boolean());

const optionalUrlField = z.preprocess(
  (v) => {
    if (typeof v !== 'string') return undefined;
    const t = v.trim();
    return t.length === 0 ? undefined : t;
  },
  z.string().url('Enlace no válido (debe empezar por https://)').max(500).optional(),
);

export const IdentitySchema = z.object({
  name: trimmedString(80),
  title: trimmedString(120),
  location: trimmedString(80),
  languages: z
    .array(z.string().transform((s) => s.trim()).pipe(z.string().min(1).max(40)))
    .max(6),
  hourly: optionalTrimmed(40),
  available: checkboxBool,
  availableLine: optionalTrimmed(80),
  cvUrl: optionalUrlField,
});

export type IdentityInput = z.infer<typeof IdentitySchema>;

export const BioSchema = z.object({
  bio: z
    .string()
    .transform((s) => s.trim())
    .pipe(z.string().max(500)),
});

export type BioInput = z.infer<typeof BioSchema>;

const SOCIAL_KINDS = ['github', 'linkedin', 'twitter', 'figma', 'read', 'website', 'custom'] as const;
type Kind = (typeof SOCIAL_KINDS)[number];

const socialHandleField = z.preprocess(
  (v) => {
    if (typeof v !== 'string') return undefined;
    const t = v.trim();
    return t.length === 0 ? undefined : t;
  },
  z.string().max(80).optional(),
);

export const SocialSchema = z.object(
  Object.fromEntries(SOCIAL_KINDS.map((k) => [k, socialHandleField])) as Record<
    Kind,
    typeof socialHandleField
  >,
);

export type SocialInput = z.infer<typeof SocialSchema>;

const SkillGroupItem = z
  .string()
  .transform((s) => s.trim())
  .pipe(z.string().min(1).max(40));

const SkillGroupEntry = z.object({
  name: trimmedString(40),
  items: z.array(SkillGroupItem).max(20),
});

export const SkillsSchema = z.object({
  groups: z.array(SkillGroupEntry).max(8),
});

export type SkillsInput = z.infer<typeof SkillsSchema>;

// ---- Experience ----

const optionalUrl = z.preprocess(
  (v) => {
    if (typeof v !== 'string') return undefined;
    const t = v.trim();
    return t.length === 0 ? undefined : t;
  },
  z.string().url().max(300).optional(),
);

const ExperienceEntry = z.object({
  role: trimmedString(80),
  org: trimmedString(80),
  period: trimmedString(40),
  blurb: optionalTrimmed(300),
  current: checkboxBool,
});

export const ExperienceSchema = z.object({
  items: z.array(ExperienceEntry).max(15),
});

export type ExperienceInput = z.infer<typeof ExperienceSchema>;

// ---- Projects ----

const ProjectStackItem = z
  .string()
  .transform((s) => s.trim())
  .pipe(z.string().min(1).max(30));

const ProjectEntry = z.object({
  title: trimmedString(80),
  tag: optionalTrimmed(40),
  blurb: optionalTrimmed(300),
  stack: z.array(ProjectStackItem).max(12),
  color: z.preprocess(
    (v) => (typeof v === 'string' && v.trim().length > 0 ? v.trim() : '#3b82f6'),
    z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Color hex inválido (ej. #3b82f6)'),
  ),
  githubUrl: optionalUrl,
  liveUrl: optionalUrl,
  highlight: checkboxBool,
});

export const ProjectsSchema = z.object({
  items: z.array(ProjectEntry).max(12),
});

export type ProjectsInput = z.infer<typeof ProjectsSchema>;

// ---- Testimonials ----

const TestimonialEntry = z.object({
  quote: trimmedString(400),
  author: trimmedString(80),
  org: optionalTrimmed(80),
});

export const TestimonialsSchema = z.object({
  items: z.array(TestimonialEntry).max(12),
});

export type TestimonialsInput = z.infer<typeof TestimonialsSchema>;

// ---- Services ----

const ServiceEntry = z.object({
  name: trimmedString(80),
  duration: trimmedString(40),
  price: trimmedString(40),
  blurb: optionalTrimmed(300),
  popular: checkboxBool,
});

export const ServicesSchema = z.object({
  items: z.array(ServiceEntry).max(12),
});

export type ServicesInput = z.infer<typeof ServicesSchema>;

// ---- Brand / personalización (spec:014) ----

const FONT_FAMILIES = ['plus-jakarta', 'inter', 'tiempos'] as const;
const LAYOUT_VARIANTS = ['default', 'sidebar', 'minimal'] as const;
const SECTION_KEYS = [
  'hero',
  'skills',
  'experience',
  'projects',
  'testimonials',
  'services',
  'contact',
] as const;

export const BrandSchema = z.object({
  accentColor: z.preprocess(
    (v) => (typeof v === 'string' && v.trim().length > 0 ? v.trim() : '#3b82f6'),
    z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Color hex inválido (ej. #3b82f6)'),
  ),
  fontFamily: z.enum(FONT_FAMILIES),
  layoutVariant: z.enum(LAYOUT_VARIANTS),
  // Orden de secciones: subconjunto/permutación de SECTION_KEYS, sin duplicados.
  sectionOrder: z
    .array(z.enum(SECTION_KEYS))
    .max(SECTION_KEYS.length)
    .transform((arr) => Array.from(new Set(arr))),
  sectionHidden: z
    .array(z.enum(SECTION_KEYS))
    .max(SECTION_KEYS.length)
    .transform((arr) => Array.from(new Set(arr))),
});

export type BrandInput = z.infer<typeof BrandSchema>;

// ---- Digital Card (spec:005 v2) ----

const CARD_STYLES = ['aurora', 'minimal', 'mesh'] as const;
const CARD_LINK_ICONS = [
  'web', 'link', 'calendar', 'doc', 'shop', 'pay', 'chat', 'video', 'music', 'map', 'telegram', 'whatsapp',
] as const;

export const CardSchema = z.object({
  cardStyle: z.enum(CARD_STYLES),
  company: optionalTrimmed(80),
  whatsapp: optionalTrimmed(30),
  whatsappMessage: optionalTrimmed(200),
});

export type CardInput = z.infer<typeof CardSchema>;

const CardLinkEntry = z.object({
  icon: z.enum(CARD_LINK_ICONS),
  label: trimmedString(40),
  url: z.string().url('Enlace no válido').max(500),
});

export const CardLinksSchema = z.object({
  items: z.array(CardLinkEntry).max(12),
});

export type CardLinksInput = z.infer<typeof CardLinksSchema>;

// ---- seeders: Profile → form initial state ----

export function identityFromProfile(profile: Profile): IdentityInput {
  return {
    name: profile.name,
    title: profile.title,
    location: profile.location,
    languages: [...profile.languages],
    hourly: profile.hourly,
    available: profile.available,
    availableLine: profile.availableLine,
    cvUrl: profile.cvUrl,
  };
}

export function bioFromProfile(profile: Profile): BioInput {
  return { bio: profile.bio };
}

export function socialFromProfile(profile: Profile): SocialInput {
  return Object.fromEntries(
    SOCIAL_KINDS.map((k) => [k, profile.social[k as SocialKind]]),
  ) as SocialInput;
}

export function skillsFromProfile(profile: Profile): SkillsInput {
  return {
    groups: Object.entries(profile.skills).map(([name, items]) => ({
      name,
      items: [...items],
    })),
  };
}

export function experienceFromProfile(profile: Profile): ExperienceInput {
  return {
    items: profile.experience.map((e) => ({
      role: e.role,
      org: e.org,
      period: e.period,
      blurb: e.blurb,
      current: e.current ?? false,
    })),
  };
}

export function projectsFromProfile(profile: Profile): ProjectsInput {
  return {
    items: profile.projects.map((p) => ({
      title: p.title,
      tag: p.tag,
      blurb: p.blurb,
      stack: [...p.stack],
      color: p.color,
      githubUrl: p.githubUrl,
      liveUrl: p.liveUrl,
      highlight: p.highlight ?? false,
    })),
  };
}

export function testimonialsFromProfile(profile: Profile): TestimonialsInput {
  return {
    items: (profile.testimonials ?? []).map((t) => ({
      quote: t.quote,
      author: t.author,
      org: t.org,
    })),
  };
}

export function servicesFromProfile(profile: Profile): ServicesInput {
  return {
    items: profile.services.map((s) => ({
      name: s.name,
      duration: typeof s.duration === 'number' ? `${s.duration} min` : s.duration,
      price: s.price,
      blurb: s.blurb,
      popular: s.popular ?? false,
    })),
  };
}

export function cardFromProfile(profile: Profile): CardInput {
  return {
    cardStyle: profile.cardStyle,
    company: profile.company,
    whatsapp: profile.whatsapp,
    whatsappMessage: profile.whatsappMessage,
  };
}

export function cardLinksFromProfile(profile: Profile): CardLinksInput {
  return { items: profile.cardLinks.map((l) => ({ icon: l.icon, label: l.label, url: l.url })) };
}

export function brandFromProfile(profile: Profile): BrandInput {
  return {
    accentColor: profile.accentColor,
    fontFamily: profile.fontFamily,
    layoutVariant: profile.layoutVariant,
    sectionOrder: [...profile.sectionOrder],
    sectionHidden: [...profile.sectionHidden],
  };
}
