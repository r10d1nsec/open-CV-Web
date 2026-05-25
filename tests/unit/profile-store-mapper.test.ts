/**
 * Unit tests for the DB row → Profile mapper.
 * Pure function, no Supabase calls — fixture in / Profile out.
 *
 * Refs: spec:002 §Implementation (Sub-sprint 3c), tarea T10.
 */
import { describe, expect, it } from 'vitest';
import { mapRowToProfile, type ProfileRowWithRelations } from '@/lib/profile-store/supabase-driver';
import { mockMaya } from '@/data/mock-maya';

function mayaRow(): ProfileRowWithRelations {
  return {
    id: 'p-maya',
    user_id: 'u-maya',
    username: 'maya',
    onboarded_at: null,
    full_name: 'Maya Okafor',
    initials: 'MO',
    title: 'Design engineer & freelance product designer',
    bio: 'I help early-stage startups ship considered product experiences — bridging brand, interface and front-end code.',
    location: 'London, UK',
    languages: ['English', 'Yoruba', 'French (B2)'],
    avatar_url: null,
    available: true,
    available_line: 'Booking projects from Sept 2026',
    hourly: '£140/hr',
    email_public: 'hello@mayaokafor.studio',
    phone_public: '+44 7700 900 184',
    website: 'mayaokafor.studio',
    is_published: true,
    created_at: '2026-05-23T00:00:00Z',
    updated_at: '2026-05-23T00:00:00Z',
    accent_color: '#3b82f6',
    cover_image_url: null,
    cv_url: null,
    font_family: 'plus-jakarta',
    layout_variant: 'default',
    section_order: ['hero', 'skills', 'experience', 'projects', 'testimonials', 'services', 'contact'],
    section_hidden: [],
    company: null,
    whatsapp: null,
    whatsapp_message: null,
    card_style: 'aurora',
    card_cover_url: null,
    card_links: [],
    social_links: [
      { id: 's1', profile_id: 'p-maya', kind: 'github', handle: 'mayaokafor', url: null, label: null, position: 0 },
      { id: 's2', profile_id: 'p-maya', kind: 'linkedin', handle: 'maya-okafor', url: null, label: null, position: 1 },
      { id: 's3', profile_id: 'p-maya', kind: 'twitter', handle: 'maya_okfr', url: null, label: null, position: 2 },
      { id: 's4', profile_id: 'p-maya', kind: 'figma', handle: 'maya', url: null, label: null, position: 3 },
      { id: 's5', profile_id: 'p-maya', kind: 'read', handle: 'mayaokafor.studio/notes', url: null, label: null, position: 4 },
    ],
    skill_groups: [
      { id: 'sg1', profile_id: 'p-maya', name: 'Design', items: ['Product design', 'Design systems', 'Brand identity', 'Type & motion'], position: 0 },
      { id: 'sg2', profile_id: 'p-maya', name: 'Frontend', items: ['React + TS', 'Next.js', 'Tailwind', 'Framer Motion', 'GSAP', 'Three.js'], position: 1 },
      { id: 'sg3', profile_id: 'p-maya', name: 'Tooling', items: ['Figma', 'Linear', 'Storybook', 'Webflow'], position: 2 },
    ],
    experience_items: [
      { id: 'e1', profile_id: 'p-maya', role: 'Freelance Design Engineer', org: 'Independent', period: '2023 — Present', blurb: 'Selected clients: Linear, Vercel, Arc, Cron. Focus on marketing sites, design systems, and product onboarding.', current: true, position: 0 },
      { id: 'e2', profile_id: 'p-maya', role: 'Senior Product Designer', org: 'Linear', period: '2021 — 2023', blurb: 'Led the Insights and Roadmaps work. Owned the v2 component library and motion language.', current: false, position: 1 },
      { id: 'e3', profile_id: 'p-maya', role: 'Product Designer', org: 'Mercury', period: '2019 — 2021', blurb: 'Designed onboarding, KYC and the Treasury beta. First brand systems engineer hire.', current: false, position: 2 },
      { id: 'e4', profile_id: 'p-maya', role: 'Frontend Engineer', org: 'thoughtbot', period: '2017 — 2019', blurb: 'Shipped product work for fintech and healthcare clients. Open-source maintainer of suspenders.', current: false, position: 3 },
    ],
    projects: [
      { id: 'pr1', profile_id: 'p-maya', title: 'Cargo OS', tag: 'Product · 2025', blurb: 'Fleet management UI redesign for a Series-B logistics platform.', stack: ['Next.js', 'Design system', 'Figma'], color: '#3b82f6', github_url: null, live_url: null, highlight: false, image_url: null, position: 0 },
      { id: 'pr2', profile_id: 'p-maya', title: 'Tessera', tag: 'Tool · 2024', blurb: 'Open-source type-pairing playground. 8k weekly users.', stack: ['React', 'OpenType.js'], color: '#a855f7', github_url: null, live_url: null, highlight: false, image_url: null, position: 1 },
      { id: 'pr3', profile_id: 'p-maya', title: 'Field Studio', tag: 'Brand · 2024', blurb: 'Identity & site for a London branding studio. WebGL crests.', stack: ['Brand', 'WebGL', 'GSAP'], color: '#f97316', github_url: null, live_url: null, highlight: false, image_url: null, position: 2 },
      { id: 'pr4', profile_id: 'p-maya', title: 'Reset Type', tag: 'OSS · 2023', blurb: 'CSS reset focused on typographic defaults. 4.2k stars.', stack: ['CSS', 'OSS'], color: '#22c55e', github_url: null, live_url: null, highlight: false, image_url: null, position: 3 },
      { id: 'pr5', profile_id: 'p-maya', title: 'Halo NFC', tag: 'Hardware · 2023', blurb: 'NFC ring + companion app prototype for personal payments.', stack: ['Swift', 'Hardware'], color: '#f43f5e', github_url: null, live_url: null, highlight: false, image_url: null, position: 4 },
      { id: 'pr6', profile_id: 'p-maya', title: 'Quiet Hours', tag: 'Side · 2023', blurb: 'A meditation timer with no streaks and no metrics.', stack: ['iOS', 'Brand'], color: '#06b6d4', github_url: null, live_url: null, highlight: false, image_url: null, position: 5 },
    ],
    services: [
      { id: 'sv1', profile_id: 'p-maya', external_id: 's1', name: 'Intro call', duration_minutes: 30, duration_text: null, price: 'Free', blurb: 'Project fit & scoping conversation. No deck required.', popular: false, is_active: true, position: 0 },
      { id: 'sv2', profile_id: 'p-maya', external_id: 's2', name: 'Design system audit', duration_minutes: 60, duration_text: null, price: '£180', blurb: 'Live review of tokens, components and gaps. Walkthrough recording included.', popular: true, is_active: true, position: 1 },
      { id: 'sv3', profile_id: 'p-maya', external_id: 's3', name: 'Front-end pairing', duration_minutes: 90, duration_text: null, price: '£260', blurb: 'Pair on a tricky animation, layout or design-engineering problem.', popular: false, is_active: true, position: 2 },
      { id: 'sv4', profile_id: 'p-maya', external_id: 's4', name: 'Project kickoff (sprint)', duration_minutes: null, duration_text: '5d', price: '£8,400', blurb: 'One-week embed: brand discovery, system audit & roadmap.', popular: false, is_active: true, position: 3 },
    ],
    testimonials: [
      { id: 't1', profile_id: 'p-maya', quote: '“The clearest design thinker I’ve worked with in a decade. Ships code, too.”', author: 'K. Yamada', org: 'CPO, Arc', position: 0 },
      { id: 't2', profile_id: 'p-maya', quote: '“Maya rebuilt our design system in six weeks. Nothing has fallen over since.”', author: 'R. Patel', org: 'Eng lead, Cron', position: 1 },
    ],
  };
}

describe('mapRowToProfile', () => {
  it('produces a Profile structurally identical to mockMaya (AC8)', () => {
    const profile = mapRowToProfile(mayaRow());
    expect(profile).toEqual(mockMaya);
  });

  it('renames full_name → name and snake_case → camelCase', () => {
    const profile = mapRowToProfile(mayaRow());
    expect(profile.name).toBe('Maya Okafor');
    expect(profile.availableLine).toBe('Booking projects from Sept 2026');
  });

  it('maps email_public/phone_public to email/phone and falls back to "" when email is null', () => {
    const row = mayaRow();
    row.email_public = null;
    row.phone_public = null;
    const profile = mapRowToProfile(row);
    expect(profile.email).toBe('');
    expect(profile.phone).toBeUndefined();
  });

  it('drops nullable strings to undefined (hourly, website, availableLine)', () => {
    const row = mayaRow();
    row.hourly = null;
    row.website = null;
    row.available_line = null;
    const profile = mapRowToProfile(row);
    expect(profile.hourly).toBeUndefined();
    expect(profile.website).toBeUndefined();
    expect(profile.availableLine).toBeUndefined();
  });

  it('groups social_links by kind, ordering by position, keeping the handle as value', () => {
    const profile = mapRowToProfile(mayaRow());
    expect(profile.social.github).toBe('mayaokafor');
    expect(profile.social.linkedin).toBe('maya-okafor');
    expect(profile.social.twitter).toBe('maya_okfr');
    expect(profile.social.figma).toBe('maya');
    expect(profile.social.read).toBe('mayaokafor.studio/notes');
  });

  it('orders skill_groups, experience, projects, services and testimonials by position ASC', () => {
    const row = mayaRow();
    // Shuffle position order to ensure mapper sorts.
    row.skill_groups = [...row.skill_groups].reverse();
    row.experience_items = [...row.experience_items].reverse();
    row.projects = [...row.projects].reverse();
    row.services = [...row.services].reverse();
    row.testimonials = [...row.testimonials].reverse();
    const profile = mapRowToProfile(row);
    expect(Object.keys(profile.skills)).toEqual(['Design', 'Frontend', 'Tooling']);
    expect(profile.experience.map((e) => e.role)).toEqual([
      'Freelance Design Engineer',
      'Senior Product Designer',
      'Product Designer',
      'Frontend Engineer',
    ]);
    expect(profile.projects.map((p) => p.title)).toEqual([
      'Cargo OS',
      'Tessera',
      'Field Studio',
      'Reset Type',
      'Halo NFC',
      'Quiet Hours',
    ]);
    expect(profile.services.map((s) => s.id)).toEqual(['s1', 's2', 's3', 's4']);
    expect(profile.testimonials?.map((t) => t.author)).toEqual(['K. Yamada', 'R. Patel']);
  });

  it('uses external_id as service.id and prefers duration_minutes over duration_text', () => {
    const profile = mapRowToProfile(mayaRow());
    expect(profile.services[0]).toMatchObject({ id: 's1', duration: 30 });
    expect(profile.services[3]).toMatchObject({ id: 's4', duration: '5d' });
  });

  it('renames project github_url/live_url to githubUrl/liveUrl (undefined when null)', () => {
    const row = mayaRow();
    row.projects[0]!.github_url = 'https://github.com/m/cargo';
    row.projects[0]!.live_url = 'https://cargo.os';
    const profile = mapRowToProfile(row);
    expect(profile.projects[0]!.githubUrl).toBe('https://github.com/m/cargo');
    expect(profile.projects[0]!.liveUrl).toBe('https://cargo.os');
    expect(profile.projects[1]!.githubUrl).toBeUndefined();
    expect(profile.projects[1]!.liveUrl).toBeUndefined();
  });

  it('omits testimonials field when the relation array is empty', () => {
    const row = mayaRow();
    row.testimonials = [];
    const profile = mapRowToProfile(row);
    expect(profile.testimonials).toBeUndefined();
  });

  it('treats unknown social_link kind as ignored (extra row does not crash)', () => {
    const row = mayaRow();
    row.social_links.push({
      id: 'sx',
      profile_id: 'p-maya',
      kind: 'website',
      handle: 'mayaokafor.studio',
      url: null,
      label: null,
      position: 5,
    });
    const profile = mapRowToProfile(row);
    expect(profile.social.website).toBe('mayaokafor.studio');
  });
});
