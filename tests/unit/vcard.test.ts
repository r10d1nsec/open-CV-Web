import { describe, expect, it } from 'vitest';
import { generateVCard, vcardFilename } from '@/lib/vcard';
import { mockMaya } from '@/data/mock-maya';
import type { Profile } from '@/types/profile';

describe('generateVCard', () => {
  const card = generateVCard(mockMaya);
  const lines = card.split('\r\n');

  it('starts and ends with the vCard envelope', () => {
    expect(lines[0]).toBe('BEGIN:VCARD');
    expect(lines[1]).toBe('VERSION:3.0');
    // Final non-empty line is END:VCARD (file ends with CRLF, splitting produces trailing '')
    expect(lines.filter(Boolean).pop()).toBe('END:VCARD');
  });

  it('includes FN, N, EMAIL, TEL, URL, ADR, NOTE', () => {
    expect(card).toMatch(/FN:Maya Okafor/);
    expect(card).toMatch(/N:Okafor;Maya;/);
    expect(card).toMatch(/TITLE:Design engineer/);
    expect(card).toMatch(/EMAIL;TYPE=INTERNET,PREF:hello@mayaokafor.studio/);
    expect(card).toMatch(/TEL;TYPE=CELL,VOICE:\+44 7700 900 184/);
    expect(card).toMatch(/URL:https:\/\/mayaokafor.studio/);
    expect(card).toMatch(/ADR;TYPE=WORK:;;;London\\, UK;;;/);
    expect(card).toMatch(/NOTE:I help/);
  });

  it('emits SOCIALPROFILE for known socials', () => {
    expect(card).toMatch(/X-SOCIALPROFILE;TYPE=github:https:\/\/github.com\/mayaokafor/);
    expect(card).toMatch(/X-SOCIALPROFILE;TYPE=linkedin:https:\/\/linkedin.com\/in\/maya-okafor/);
  });

  it('uses CRLF line endings', () => {
    expect(card).toContain('\r\n');
    expect(card.split('\r\n').length).toBeGreaterThan(8);
  });

  it('escapes commas and semicolons in text fields', () => {
    const profile: Profile = {
      ...mockMaya,
      name: 'Alice, Smith',
      bio: 'I write notes; sometimes long ones.',
      location: 'Berlin, DE',
    };
    const vc = generateVCard(profile);
    expect(vc).toMatch(/FN:Alice\\, Smith/);
    expect(vc).toMatch(/NOTE:I write notes\\; sometimes long ones\./);
  });

  it('folds long lines at 75 chars', () => {
    const longBio = 'A'.repeat(200);
    const vc = generateVCard({ ...mockMaya, bio: longBio });
    const noteLines = vc.split('\r\n').filter((l) => l.startsWith('NOTE:') || l.startsWith(' A'));
    expect(noteLines.length).toBeGreaterThan(1);
    for (const line of noteLines) {
      expect(line.length).toBeLessThanOrEqual(75);
    }
  });

  it('omits TEL/URL/NOTE/ADR when missing', () => {
    const minimal: Profile = {
      ...mockMaya,
      phone: undefined,
      website: undefined,
      bio: '',
      location: '',
    };
    const vc = generateVCard(minimal);
    expect(vc).not.toMatch(/TEL/);
    expect(vc).not.toMatch(/URL/);
    expect(vc).not.toMatch(/NOTE/);
    expect(vc).not.toMatch(/ADR/);
  });

  it('always includes ORG', () => {
    expect(card).toMatch(/^ORG:Independent$/m);
  });
});

describe('vcardFilename', () => {
  it('slugifies the name', () => {
    expect(vcardFilename(mockMaya)).toBe('maya-okafor.vcf');
  });
  it('falls back to username when name has no ascii letters', () => {
    expect(vcardFilename({ ...mockMaya, name: '!!!' })).toBe('maya.vcf');
  });
});
