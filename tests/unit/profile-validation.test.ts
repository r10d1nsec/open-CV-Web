/**
 * Tests for the profile editor validators (zod schemas).
 *
 * Refs: spec:002 §Non-functional (validation), Sprint 4 S4.6.
 */
import { describe, expect, it } from 'vitest';
import {
  BioSchema,
  IdentitySchema,
  SkillsSchema,
  SocialSchema,
  ExperienceSchema,
  ProjectsSchema,
  TestimonialsSchema,
  ServicesSchema,
  BrandSchema,
  CardSchema,
  CardLinksSchema,
  brandFromProfile,
  identityFromProfile,
  bioFromProfile,
  socialFromProfile,
  skillsFromProfile,
  experienceFromProfile,
  projectsFromProfile,
  testimonialsFromProfile,
  servicesFromProfile,
} from '@/lib/validation/profile';
import { mockMaya } from '@/data/mock-maya';

describe('IdentitySchema', () => {
  const valid = {
    name: 'Maya Okafor',
    title: 'Design engineer & freelance product designer',
    location: 'London, UK',
    languages: ['English', 'Yoruba', 'French (B2)'],
    hourly: '£140/hr',
    available: true,
    availableLine: 'Booking projects from Sept 2026',
  };

  it('accepts a well-formed identity', () => {
    expect(IdentitySchema.parse(valid)).toMatchObject(valid);
  });

  it('rejects empty name', () => {
    expect(() => IdentitySchema.parse({ ...valid, name: '' })).toThrow();
    expect(() => IdentitySchema.parse({ ...valid, name: '   ' })).toThrow();
  });

  it('rejects name > 80 chars', () => {
    expect(() => IdentitySchema.parse({ ...valid, name: 'a'.repeat(81) })).toThrow();
  });

  it('trims and lowercases nothing but cleans whitespace ends', () => {
    const out = IdentitySchema.parse({ ...valid, name: '  Maya Okafor  ' });
    expect(out.name).toBe('Maya Okafor');
  });

  it('rejects languages array longer than 6 items', () => {
    expect(() =>
      IdentitySchema.parse({ ...valid, languages: ['a', 'b', 'c', 'd', 'e', 'f', 'g'] }),
    ).toThrow();
  });

  it('coerces available to boolean from form data string', () => {
    expect(IdentitySchema.parse({ ...valid, available: 'on' }).available).toBe(true);
    expect(IdentitySchema.parse({ ...valid, available: undefined }).available).toBe(false);
    expect(IdentitySchema.parse({ ...valid, available: false }).available).toBe(false);
  });

  it('drops empty optional fields to undefined', () => {
    const out = IdentitySchema.parse({ ...valid, hourly: '', availableLine: '   ' });
    expect(out.hourly).toBeUndefined();
    expect(out.availableLine).toBeUndefined();
  });

  it('seeds correctly from an existing Profile', () => {
    const seed = identityFromProfile(mockMaya);
    expect(IdentitySchema.parse(seed)).toEqual({
      name: mockMaya.name,
      title: mockMaya.title,
      location: mockMaya.location,
      languages: mockMaya.languages,
      hourly: mockMaya.hourly,
      available: mockMaya.available,
      availableLine: mockMaya.availableLine,
    });
  });
});

describe('BioSchema', () => {
  it('accepts a non-empty bio', () => {
    expect(BioSchema.parse({ bio: 'Hello world' })).toEqual({ bio: 'Hello world' });
  });

  it('rejects bio > 500 chars', () => {
    expect(() => BioSchema.parse({ bio: 'a'.repeat(501) })).toThrow();
  });

  it('allows empty string (alumnos pueden vaciar la bio)', () => {
    expect(BioSchema.parse({ bio: '' })).toEqual({ bio: '' });
  });

  it('trims surrounding whitespace', () => {
    expect(BioSchema.parse({ bio: '  hi  ' })).toEqual({ bio: 'hi' });
  });

  it('seeds from profile', () => {
    expect(bioFromProfile(mockMaya).bio).toBe(mockMaya.bio);
  });
});

describe('SocialSchema', () => {
  it('accepts all known kinds with sensible handles', () => {
    const out = SocialSchema.parse({
      github: 'mayaokafor',
      linkedin: 'maya-okafor',
      twitter: 'maya_okfr',
      figma: 'maya',
      website: 'mayaokafor.studio',
    });
    expect(out).toMatchObject({
      github: 'mayaokafor',
      linkedin: 'maya-okafor',
      twitter: 'maya_okfr',
      figma: 'maya',
      website: 'mayaokafor.studio',
    });
  });

  it('strips empty handles to undefined', () => {
    const out = SocialSchema.parse({ github: '', linkedin: '  ', twitter: 'x' });
    expect(out.github).toBeUndefined();
    expect(out.linkedin).toBeUndefined();
    expect(out.twitter).toBe('x');
  });

  it('rejects handles > 80 chars', () => {
    expect(() => SocialSchema.parse({ github: 'x'.repeat(81) })).toThrow();
  });

  it('seeds from profile', () => {
    const seed = socialFromProfile(mockMaya);
    expect(SocialSchema.parse(seed).github).toBe(mockMaya.social.github);
    expect(SocialSchema.parse(seed).linkedin).toBe(mockMaya.social.linkedin);
  });
});

describe('SkillsSchema', () => {
  it('accepts groups with name + items array', () => {
    const out = SkillsSchema.parse({
      groups: [
        { name: 'Design', items: ['Product design', 'Brand'] },
        { name: 'Frontend', items: ['React', 'Next.js'] },
      ],
    });
    expect(out.groups).toHaveLength(2);
    expect(out.groups[0]?.items).toContain('Product design');
  });

  it('rejects groups with empty name', () => {
    expect(() =>
      SkillsSchema.parse({ groups: [{ name: '', items: ['x'] }] }),
    ).toThrow();
  });

  it('rejects items shorter than 1 char after trim', () => {
    expect(() =>
      SkillsSchema.parse({ groups: [{ name: 'X', items: ['   '] }] }),
    ).toThrow();
  });

  it('limits groups to 8 and items to 20 per group', () => {
    const tooMany = Array.from({ length: 9 }, (_, i) => ({ name: `g${i}`, items: ['x'] }));
    expect(() => SkillsSchema.parse({ groups: tooMany })).toThrow();
    expect(() =>
      SkillsSchema.parse({
        groups: [{ name: 'X', items: Array.from({ length: 21 }, (_, i) => `i${i}`) }],
      }),
    ).toThrow();
  });

  it('seeds from profile preserving order', () => {
    const seed = skillsFromProfile(mockMaya);
    expect(seed.groups.map((g) => g.name)).toEqual(['Design', 'Frontend', 'Tooling']);
  });
});

describe('ExperienceSchema', () => {
  const item = { role: 'Design engineer', org: 'Acme', period: '2023 — Actual', blurb: 'Cosas', current: true };

  it('accepts a well-formed experience list', () => {
    const out = ExperienceSchema.parse({ items: [item] });
    expect(out.items[0]).toMatchObject({ role: 'Design engineer', org: 'Acme', current: true });
  });

  it('coerces current from checkbox "on"/absent', () => {
    expect(ExperienceSchema.parse({ items: [{ ...item, current: 'on' }] }).items[0]?.current).toBe(true);
    expect(ExperienceSchema.parse({ items: [{ ...item, current: undefined }] }).items[0]?.current).toBe(false);
  });

  it('rejects empty role/org/period', () => {
    expect(() => ExperienceSchema.parse({ items: [{ ...item, role: '' }] })).toThrow();
    expect(() => ExperienceSchema.parse({ items: [{ ...item, org: '  ' }] })).toThrow();
    expect(() => ExperienceSchema.parse({ items: [{ ...item, period: '' }] })).toThrow();
  });

  it('limits to 15 items', () => {
    const many = Array.from({ length: 16 }, () => item);
    expect(() => ExperienceSchema.parse({ items: many })).toThrow();
  });

  it('accepts an empty list', () => {
    expect(ExperienceSchema.parse({ items: [] }).items).toEqual([]);
  });

  it('seeds from profile preserving order', () => {
    const seed = experienceFromProfile(mockMaya);
    expect(seed.items.length).toBeGreaterThan(0);
    expect(seed.items[0]).toHaveProperty('role');
  });
});

describe('ProjectsSchema', () => {
  const item = {
    title: 'Folio',
    tag: 'SaaS',
    blurb: 'Portfolio builder',
    stack: ['React', 'TypeScript'],
    color: '#3b82f6',
    githubUrl: 'https://github.com/x/y',
    liveUrl: 'https://example.com',
    highlight: true,
  };

  it('accepts a well-formed project', () => {
    const out = ProjectsSchema.parse({ items: [item] });
    expect(out.items[0]).toMatchObject({ title: 'Folio', color: '#3b82f6', highlight: true });
  });

  it('defaults color to #3b82f6 when empty', () => {
    expect(ProjectsSchema.parse({ items: [{ ...item, color: '' }] }).items[0]?.color).toBe('#3b82f6');
  });

  it('rejects invalid hex color', () => {
    expect(() => ProjectsSchema.parse({ items: [{ ...item, color: 'blue' }] })).toThrow();
    expect(() => ProjectsSchema.parse({ items: [{ ...item, color: '#zzz' }] })).toThrow();
  });

  it('rejects invalid urls', () => {
    expect(() => ProjectsSchema.parse({ items: [{ ...item, liveUrl: 'not-a-url' }] })).toThrow();
  });

  it('treats empty urls as undefined', () => {
    const out = ProjectsSchema.parse({ items: [{ ...item, githubUrl: '', liveUrl: '' }] });
    expect(out.items[0]?.githubUrl).toBeUndefined();
    expect(out.items[0]?.liveUrl).toBeUndefined();
  });

  it('limits stack to 12 and projects to 12', () => {
    expect(() =>
      ProjectsSchema.parse({ items: [{ ...item, stack: Array.from({ length: 13 }, (_, i) => `s${i}`) }] }),
    ).toThrow();
    expect(() =>
      ProjectsSchema.parse({ items: Array.from({ length: 13 }, () => item) }),
    ).toThrow();
  });

  it('seeds from profile', () => {
    const seed = projectsFromProfile(mockMaya);
    expect(seed.items.length).toBeGreaterThan(0);
    expect(seed.items[0]?.color).toMatch(/^#[0-9a-fA-F]{6}$/);
  });
});

describe('TestimonialsSchema', () => {
  const item = { quote: 'Great work', author: 'Jane', org: 'Acme' };

  it('accepts a well-formed testimonial', () => {
    expect(TestimonialsSchema.parse({ items: [item] }).items[0]).toMatchObject(item);
  });

  it('rejects empty quote/author', () => {
    expect(() => TestimonialsSchema.parse({ items: [{ ...item, quote: '' }] })).toThrow();
    expect(() => TestimonialsSchema.parse({ items: [{ ...item, author: '  ' }] })).toThrow();
  });

  it('allows empty org', () => {
    expect(TestimonialsSchema.parse({ items: [{ ...item, org: '' }] }).items[0]?.org).toBeUndefined();
  });

  it('limits to 12', () => {
    expect(() => TestimonialsSchema.parse({ items: Array.from({ length: 13 }, () => item) })).toThrow();
  });

  it('seeds from profile (possibly empty)', () => {
    expect(Array.isArray(testimonialsFromProfile(mockMaya).items)).toBe(true);
  });
});

describe('ServicesSchema', () => {
  const item = { name: 'Consultoría', duration: '60 min', price: '€90', blurb: 'Sesión', popular: true };

  it('accepts a well-formed service', () => {
    expect(ServicesSchema.parse({ items: [item] }).items[0]).toMatchObject({ name: 'Consultoría', popular: true });
  });

  it('rejects empty name/duration/price', () => {
    expect(() => ServicesSchema.parse({ items: [{ ...item, name: '' }] })).toThrow();
    expect(() => ServicesSchema.parse({ items: [{ ...item, duration: '' }] })).toThrow();
    expect(() => ServicesSchema.parse({ items: [{ ...item, price: '  ' }] })).toThrow();
  });

  it('limits to 12', () => {
    expect(() => ServicesSchema.parse({ items: Array.from({ length: 13 }, () => item) })).toThrow();
  });

  it('seeds from profile mapping numeric duration to text', () => {
    const seed = servicesFromProfile(mockMaya);
    expect(seed.items.length).toBeGreaterThan(0);
    expect(typeof seed.items[0]?.duration).toBe('string');
  });
});

describe('BrandSchema', () => {
  const valid = {
    accentColor: '#14b8a6',
    fontFamily: 'inter',
    layoutVariant: 'sidebar',
    sectionOrder: ['hero', 'projects', 'skills', 'contact'],
    sectionHidden: ['services'],
  };

  it('accepts a well-formed brand config', () => {
    expect(BrandSchema.parse(valid)).toMatchObject({ accentColor: '#14b8a6', fontFamily: 'inter', layoutVariant: 'sidebar' });
  });

  it('defaults accent to #3b82f6 when empty and rejects bad hex', () => {
    expect(BrandSchema.parse({ ...valid, accentColor: '' }).accentColor).toBe('#3b82f6');
    expect(() => BrandSchema.parse({ ...valid, accentColor: 'teal' })).toThrow();
  });

  it('rejects unknown font/layout/section', () => {
    expect(() => BrandSchema.parse({ ...valid, fontFamily: 'comic-sans' })).toThrow();
    expect(() => BrandSchema.parse({ ...valid, layoutVariant: 'grid' })).toThrow();
    expect(() => BrandSchema.parse({ ...valid, sectionOrder: ['hero', 'nope'] })).toThrow();
  });

  it('dedupes section arrays', () => {
    const out = BrandSchema.parse({ ...valid, sectionOrder: ['hero', 'hero', 'projects'] });
    expect(out.sectionOrder).toEqual(['hero', 'projects']);
  });

  it('seeds from profile', () => {
    const seed = brandFromProfile(mockMaya);
    expect(seed.accentColor).toBe('#3b82f6');
    expect(seed.fontFamily).toBe('plus-jakarta');
    expect(seed.sectionOrder).toContain('hero');
  });
});

describe('IdentitySchema · cvUrl', () => {
  const base = { name: 'X', title: 'Y', location: 'Z', languages: [], available: false };
  it('acepta una URL válida', () => {
    expect(IdentitySchema.parse({ ...base, cvUrl: 'https://drive.google.com/file/d/abc/view' }).cvUrl)
      .toBe('https://drive.google.com/file/d/abc/view');
  });
  it('trata vacío como undefined', () => {
    expect(IdentitySchema.parse({ ...base, cvUrl: '   ' }).cvUrl).toBeUndefined();
  });
  it('rechaza una URL inválida', () => {
    expect(() => IdentitySchema.parse({ ...base, cvUrl: 'no-soy-url' })).toThrow();
  });
});

describe('CardSchema / CardLinksSchema', () => {
  it('acepta estilo válido y campos opcionales', () => {
    const out = CardSchema.parse({ cardStyle: 'mesh', company: 'ARCODE', whatsapp: '+34 600 000 000', whatsappMessage: 'Hola' });
    expect(out).toMatchObject({ cardStyle: 'mesh', company: 'ARCODE' });
  });
  it('rechaza un estilo desconocido', () => {
    expect(() => CardSchema.parse({ cardStyle: 'neon' })).toThrow();
  });
  it('valida enlaces (icono del set + url válida)', () => {
    const out = CardLinksSchema.parse({ items: [{ icon: 'web', label: 'Mi web', url: 'https://arcode.es' }] });
    expect(out.items[0]).toMatchObject({ icon: 'web', label: 'Mi web' });
  });
  it('rechaza icono fuera del set o url inválida', () => {
    expect(() => CardLinksSchema.parse({ items: [{ icon: 'rocket', label: 'x', url: 'https://x.com' }] })).toThrow();
    expect(() => CardLinksSchema.parse({ items: [{ icon: 'web', label: 'x', url: 'no-url' }] })).toThrow();
  });
});
