/**
 * Supabase driver for the profile store.
 *
 * - `getProfileFromSupabase(username)` performs a single PostgREST query with
 *   embedded resources (`social_links`, `skill_groups`, `experience_items`,
 *   `projects`, `services`, `testimonials`) and maps the row to the canonical
 *   `Profile` shape consumed by `/u/[username]`, `/card/[username]` and
 *   `/u/[username]/booking`.
 * - `mapRowToProfile(row)` is exported separately because it is a pure function
 *   and is unit-tested without touching Supabase.
 *
 * Refs: spec:002 §Implementation (Sub-sprint 3c), adr:0003 (schema & RLS).
 */
import { createClient } from '@/lib/supabase/server';
import type { Tables } from '@/lib/supabase/types';
import {
  DEFAULT_SECTION_ORDER,
  type CardLink,
  type ExperienceItem,
  type Profile,
  type Project,
  type Service,
  type SkillGroup,
  type SocialKind,
  type Testimonial,
} from '@/types/profile';

// Columna añadida por la migración 0005 (Sprint 5) — los tipos generados
// pueden no incluirla hasta que se regenere `lib/supabase/types.ts` tras el
// push. Se interseca a mano aquí para que el mapper la pueda leer.
type ProfileRow = Tables<'profiles'> & { onboarded_at?: string | null };
type SocialLinkRow = Tables<'social_links'>;
type SkillGroupRow = Tables<'skill_groups'>;
type ExperienceRow = Tables<'experience_items'>;
type ProjectRow = Tables<'projects'>;
type ServiceRow = Tables<'services'>;
type TestimonialRow = Tables<'testimonials'>;
type CardLinkRow = Tables<'card_links'>;

export type ProfileRowWithRelations = ProfileRow & {
  social_links: SocialLinkRow[];
  skill_groups: SkillGroupRow[];
  experience_items: ExperienceRow[];
  projects: ProjectRow[];
  services: ServiceRow[];
  testimonials: TestimonialRow[];
  card_links: CardLinkRow[];
};

const SOCIAL_KINDS: readonly SocialKind[] = [
  'github',
  'linkedin',
  'twitter',
  'figma',
  'read',
  'website',
  'custom',
];

function byPosition<T extends { position: number }>(rows: readonly T[]): T[] {
  return [...rows].sort((a, b) => a.position - b.position);
}

function mapSocial(rows: readonly SocialLinkRow[]): Profile['social'] {
  const social: Partial<Record<SocialKind, string>> = {};
  for (const row of byPosition(rows)) {
    if ((SOCIAL_KINDS as readonly string[]).includes(row.kind)) {
      social[row.kind as SocialKind] = row.handle;
    }
  }
  return social;
}

function mapSkills(rows: readonly SkillGroupRow[]): SkillGroup {
  const skills: Record<string, readonly string[]> = {};
  for (const row of byPosition(rows)) {
    skills[row.name] = row.items;
  }
  return skills;
}

function mapExperience(rows: readonly ExperienceRow[]): readonly ExperienceItem[] {
  return byPosition(rows).map((row) => {
    const item: ExperienceItem = {
      role: row.role,
      org: row.org,
      period: row.period,
      blurb: row.blurb,
    };
    if (row.current) item.current = true;
    return item;
  });
}

function mapProjects(rows: readonly ProjectRow[]): readonly Project[] {
  return byPosition(rows).map((row) => {
    const project: Project = {
      title: row.title,
      tag: row.tag,
      blurb: row.blurb,
      stack: row.stack,
      color: row.color,
    };
    if (row.github_url) project.githubUrl = row.github_url;
    if (row.live_url) project.liveUrl = row.live_url;
    if (row.highlight) project.highlight = true;
    if (row.image_url) project.imageUrl = row.image_url;
    return project;
  });
}

function mapServices(rows: readonly ServiceRow[]): readonly Service[] {
  return byPosition(rows).map((row) => {
    const duration: Service['duration'] = row.duration_minutes ?? row.duration_text ?? 0;
    const service: Service = {
      id: row.external_id,
      name: row.name,
      duration,
      price: row.price,
      blurb: row.blurb,
    };
    if (row.popular) service.popular = true;
    return service;
  });
}

function mapTestimonials(rows: readonly TestimonialRow[]): readonly Testimonial[] | undefined {
  if (rows.length === 0) return undefined;
  return byPosition(rows).map<Testimonial>((row) => ({
    quote: row.quote,
    author: row.author,
    org: row.org,
  }));
}

const CARD_LINK_ICONS = new Set<CardLink['icon']>([
  'web', 'link', 'calendar', 'doc', 'shop', 'pay', 'chat', 'video', 'music', 'map', 'telegram', 'whatsapp',
]);

function mapCardLinks(rows: readonly CardLinkRow[]): readonly CardLink[] {
  return byPosition(rows).map((row) => ({
    icon: (CARD_LINK_ICONS.has(row.icon as CardLink['icon']) ? row.icon : 'link') as CardLink['icon'],
    label: row.label,
    url: row.url,
  }));
}

export function mapRowToProfile(row: ProfileRowWithRelations): Profile {
  const profile: Profile = {
    name: row.full_name,
    initials: row.initials,
    username: row.username,
    title: row.title,
    bio: row.bio,
    location: row.location,
    available: row.available,
    languages: row.languages,
    email: row.email_public ?? '',
    social: mapSocial(row.social_links),
    skills: mapSkills(row.skill_groups),
    experience: mapExperience(row.experience_items),
    projects: mapProjects(row.projects),
    services: mapServices(row.services),
    accentColor: row.accent_color,
    fontFamily: (row.font_family as Profile['fontFamily']) ?? 'plus-jakarta',
    layoutVariant: (row.layout_variant as Profile['layoutVariant']) ?? 'default',
    sectionOrder: (row.section_order as Profile['sectionOrder']) ?? DEFAULT_SECTION_ORDER,
    sectionHidden: (row.section_hidden as Profile['sectionHidden']) ?? [],
    cardStyle: (row.card_style as Profile['cardStyle']) ?? 'aurora',
    cardLinks: mapCardLinks(row.card_links ?? []),
  };
  if (row.company) profile.company = row.company;
  if (row.whatsapp) profile.whatsapp = row.whatsapp;
  if (row.whatsapp_message) profile.whatsappMessage = row.whatsapp_message;
  if (row.card_cover_url) profile.cardCoverUrl = row.card_cover_url;
  if (row.cover_image_url) profile.coverImageUrl = row.cover_image_url;
  if (row.available_line) profile.availableLine = row.available_line;
  if (row.hourly) profile.hourly = row.hourly;
  if (row.phone_public) profile.phone = row.phone_public;
  if (row.website) profile.website = row.website;
  if (row.cv_url) profile.cvUrl = row.cv_url;
  if (row.avatar_url) profile.avatarUrl = row.avatar_url;
  if (row.onboarded_at) profile.onboardedAt = row.onboarded_at;
  const testimonials = mapTestimonials(row.testimonials);
  if (testimonials) profile.testimonials = testimonials;
  return profile;
}

const EMBED = `
  *,
  social_links(*),
  skill_groups(*),
  experience_items(*),
  projects(*),
  services(*),
  testimonials(*),
  card_links(*)
`;

export async function getProfileFromSupabase(username: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select(EMBED)
    .eq('username', username)
    .maybeSingle<ProfileRowWithRelations>();

  if (error) throw error;
  if (!data) return null;
  return mapRowToProfile(data);
}

export async function getProfileFromSupabaseByUserId(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select(EMBED)
    .eq('user_id', userId)
    .maybeSingle<ProfileRowWithRelations>();

  if (error) throw error;
  if (!data) return null;
  return mapRowToProfile(data);
}
