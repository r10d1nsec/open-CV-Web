/**
 * Server Actions del editor de contenido (Sprint 7 · spec:013) — unit tests
 * con Supabase mockeado.
 *
 * Estrategia (igual que auth-actions.test.ts):
 *   - Mock `@/lib/supabase/server` con un query-builder encadenable falso que
 *     registra los inserts/deletes y devuelve resultados configurables.
 *   - Mock `next/cache` — revalidatePath() es un spy no-op.
 *
 * Cubre: updateExperience, updateProjects, updateTestimonials, updateServices.
 * Verifica: auth gate, validación (fieldErrors), estrategia replace
 * (delete-all + reinsert), mapeo camelCase→snake_case y position incremental.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type Captured = { table: string; rows: Record<string, unknown>[] };

const state = vi.hoisted(() => ({
  user: { id: 'u-1' } as { id: string } | null,
  profile: { id: 'p-1', username: 'maya' } as { id: string; username: string } | null,
  deletes: [] as string[],
  inserts: [] as Captured[],
  failInsert: false,
  failDelete: false,
}));

const supabaseMocks = vi.hoisted(() => ({
  createClient: vi.fn(async () => {
    const auth = { getUser: vi.fn(async () => ({ data: { user: state.user } })) };
    function from(table: string) {
      const builder: Record<string, unknown> = {};
      builder.select = vi.fn(() => builder);
      builder.delete = vi.fn(() => {
        state.deletes.push(table);
        return builder;
      });
      builder.update = vi.fn((row: Record<string, unknown>) => {
        state.inserts.push({ table: `${table}:update`, rows: [row] });
        return builder;
      });
      builder.eq = vi.fn(() => builder);
      builder.maybeSingle = vi.fn(async () => ({ data: state.profile, error: null }));
      builder.insert = vi.fn(async (rows: Record<string, unknown>[]) => {
        state.inserts.push({ table, rows });
        return { error: state.failInsert ? { message: 'insert failed' } : null };
      });
      // delete().eq(...) es awaitable → thenable resuelve {error}
      builder.then = (resolve: (v: { error: unknown }) => void) =>
        resolve({ error: state.failDelete ? { message: 'delete failed' } : null });
      return builder;
    }
    return { auth, from: vi.fn(from) };
  }),
}));

vi.mock('@/lib/supabase/server', () => ({ createClient: supabaseMocks.createClient }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

import {
  updateExperience,
  updateProjects,
  updateTestimonials,
  updateServices,
  updateBrand,
  updateCard,
  updateCardLinks,
} from '@/app/(dashboard)/dashboard/edit/_actions/update-profile';

function fd(entries: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(entries)) f.append(k, v);
  return f;
}

beforeEach(() => {
  state.user = { id: 'u-1' };
  state.profile = { id: 'p-1', username: 'maya' };
  state.deletes = [];
  state.inserts = [];
  state.failInsert = false;
  state.failDelete = false;
});

afterEach(() => vi.clearAllMocks());

describe('updateExperience', () => {
  it('rejects when not authenticated', async () => {
    state.user = null;
    const res = await updateExperience({ ok: true }, fd({}));
    expect(res.ok).toBe(false);
  });

  it('persists experience with replace strategy and incremental position', async () => {
    const form = fd({
      'items[0][role]': 'Dev',
      'items[0][org]': 'Acme',
      'items[0][period]': '2023',
      'items[0][blurb]': 'x',
      'items[0][current]': 'on',
      'items[1][role]': 'Lead',
      'items[1][org]': 'Globex',
      'items[1][period]': '2024',
    });
    const res = await updateExperience({ ok: true }, form);
    expect(res.ok).toBe(true);
    expect(state.deletes).toContain('experience_items');
    expect(state.inserts[0]?.table).toBe('experience_items');
    const rows = state.inserts[0]?.rows ?? [];
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ role: 'Dev', org: 'Acme', current: true, position: 0 });
    expect(rows[1]).toMatchObject({ role: 'Lead', current: false, position: 1 });
  });

  it('returns fieldErrors on invalid input (empty role)', async () => {
    const res = await updateExperience(
      { ok: true },
      fd({ 'items[0][role]': '', 'items[0][org]': 'Acme', 'items[0][period]': '2023' }),
    );
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.fieldErrors).toBeDefined();
    expect(state.inserts).toHaveLength(0);
  });

  it('clears all items when list is empty (delete, no insert)', async () => {
    const res = await updateExperience({ ok: true }, fd({}));
    expect(res.ok).toBe(true);
    expect(state.deletes).toContain('experience_items');
    expect(state.inserts).toHaveLength(0);
  });
});

describe('updateProjects', () => {
  it('persists projects mapping camelCase→snake_case and csv stack', async () => {
    const form = fd({
      'items[0][title]': 'Folio',
      'items[0][tag]': 'SaaS',
      'items[0][stack]': 'React, TypeScript, CSS',
      'items[0][color]': '#abcdef',
      'items[0][githubUrl]': 'https://github.com/x/y',
      'items[0][liveUrl]': '',
      'items[0][highlight]': 'on',
    });
    const res = await updateProjects({ ok: true }, form);
    expect(res.ok).toBe(true);
    const rows = state.inserts[0]?.rows ?? [];
    expect(rows[0]).toMatchObject({
      title: 'Folio',
      color: '#abcdef',
      github_url: 'https://github.com/x/y',
      live_url: null,
      highlight: true,
      position: 0,
    });
    expect((rows[0] as { stack: string[] }).stack).toEqual(['React', 'TypeScript', 'CSS']);
  });

  it('rejects invalid hex color', async () => {
    const res = await updateProjects(
      { ok: true },
      fd({ 'items[0][title]': 'X', 'items[0][color]': 'blue' }),
    );
    expect(res.ok).toBe(false);
    expect(state.inserts).toHaveLength(0);
  });
});

describe('updateTestimonials', () => {
  it('persists testimonials with position', async () => {
    const res = await updateTestimonials(
      { ok: true },
      fd({ 'items[0][quote]': 'Great', 'items[0][author]': 'Jane', 'items[0][org]': 'Acme' }),
    );
    expect(res.ok).toBe(true);
    expect(state.inserts[0]?.rows[0]).toMatchObject({ quote: 'Great', author: 'Jane', org: 'Acme', position: 0 });
  });

  it('rejects empty quote', async () => {
    const res = await updateTestimonials({ ok: true }, fd({ 'items[0][quote]': '', 'items[0][author]': 'Jane' }));
    expect(res.ok).toBe(false);
  });
});

describe('updateServices', () => {
  it('persists services with external_id, duration_text and is_active', async () => {
    const res = await updateServices(
      { ok: true },
      fd({ 'items[0][name]': 'Consultoría', 'items[0][duration]': '60 min', 'items[0][price]': '€90', 'items[0][popular]': 'on' }),
    );
    expect(res.ok).toBe(true);
    expect(state.inserts[0]?.rows[0]).toMatchObject({
      name: 'Consultoría',
      duration_text: '60 min',
      price: '€90',
      popular: true,
      is_active: true,
      external_id: 'svc-0',
      position: 0,
    });
  });

  it('surfaces a generic error when insert fails', async () => {
    state.failInsert = true;
    const res = await updateServices(
      { ok: true },
      fd({ 'items[0][name]': 'X', 'items[0][duration]': '30', 'items[0][price]': '€1' }),
    );
    expect(res.ok).toBe(false);
  });
});

describe('updateBrand', () => {
  it('persists personalization mapped to snake_case', async () => {
    const form = fd({
      accentColor: '#14b8a6',
      fontFamily: 'inter',
      layoutVariant: 'sidebar',
      sectionOrder: 'hero,projects,skills,contact',
      sectionHidden: 'services',
    });
    const res = await updateBrand({ ok: true }, form);
    expect(res.ok).toBe(true);
    const cap = state.inserts.find((c) => c.table === 'profiles:update');
    expect(cap?.rows[0]).toMatchObject({
      accent_color: '#14b8a6',
      font_family: 'inter',
      layout_variant: 'sidebar',
    });
    expect((cap?.rows[0] as { section_order: string[] }).section_order).toEqual(['hero', 'projects', 'skills', 'contact']);
    expect((cap?.rows[0] as { section_hidden: string[] }).section_hidden).toEqual(['services']);
  });

  it('rejects an invalid accent hex', async () => {
    const res = await updateBrand(
      { ok: true },
      fd({ accentColor: 'teal', fontFamily: 'inter', layoutVariant: 'default', sectionOrder: 'hero,contact', sectionHidden: '' }),
    );
    expect(res.ok).toBe(false);
  });
});

describe('updateCard / updateCardLinks', () => {
  it('persists card settings mapped to snake_case', async () => {
    const res = await updateCard({ ok: true }, fd({ cardStyle: 'mesh', company: 'ARCODE', whatsapp: '+34600', whatsappMessage: 'Hola' }));
    expect(res.ok).toBe(true);
    const cap = state.inserts.find((c) => c.table === 'profiles:update');
    expect(cap?.rows[0]).toMatchObject({ card_style: 'mesh', company: 'ARCODE', whatsapp: '+34600', whatsapp_message: 'Hola' });
  });
  it('rejects unknown card style', async () => {
    const res = await updateCard({ ok: true }, fd({ cardStyle: 'neon' }));
    expect(res.ok).toBe(false);
  });
  it('persists card links with position', async () => {
    const res = await updateCardLinks({ ok: true }, fd({ 'items[0][icon]': 'web', 'items[0][label]': 'Web', 'items[0][url]': 'https://arcode.es' }));
    expect(res.ok).toBe(true);
    const cap = state.inserts.find((c) => c.table === 'card_links');
    expect(cap?.rows[0]).toMatchObject({ icon: 'web', label: 'Web', url: 'https://arcode.es', position: 0 });
  });
  it('rejects an invalid link url', async () => {
    const res = await updateCardLinks({ ok: true }, fd({ 'items[0][icon]': 'web', 'items[0][label]': 'Web', 'items[0][url]': 'nope' }));
    expect(res.ok).toBe(false);
  });
});
