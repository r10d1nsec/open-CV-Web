/**
 * vCard 3.0 generator (RFC 2426).
 * Outputs CRLF-separated lines, with content-line folding at 75 octets per RFC.
 * Compatible with iOS Contacts, Google Contacts, Outlook.
 */

import type { Profile } from '@/types/profile';

/** Escape a TEXT-type value for vCard 3.0. */
function escapeText(input: string): string {
  return input
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

/** Fold a vCard content line at 75 octets, continuation lines start with a single space. */
function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const out: string[] = [];
  let remaining = line;
  out.push(remaining.slice(0, 75));
  remaining = remaining.slice(75);
  while (remaining.length > 0) {
    const chunk = remaining.slice(0, 74);
    out.push(' ' + chunk);
    remaining = remaining.slice(74);
  }
  return out.join('\r\n');
}

function splitName(fullName: string): { family: string; given: string; additional: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return { family: '', given: '', additional: '' };
  if (parts.length === 1) return { family: parts[0] ?? '', given: '', additional: '' };
  const family = parts[parts.length - 1] ?? '';
  const given = parts[0] ?? '';
  const additional = parts.slice(1, -1).join(' ');
  return { family, given, additional };
}

const SOCIAL_BASE_URL: Record<string, string> = {
  github: 'https://github.com/',
  linkedin: 'https://linkedin.com/in/',
  twitter: 'https://twitter.com/',
  figma: 'https://figma.com/@',
};

/** Generate a vCard 3.0 string from a Profile. */
export function generateVCard(profile: Profile): string {
  const { family, given, additional } = splitName(profile.name);
  const lines: string[] = [];

  lines.push('BEGIN:VCARD');
  lines.push('VERSION:3.0');
  lines.push(`N:${escapeText(family)};${escapeText(given)};${escapeText(additional)};;`);
  lines.push(`FN:${escapeText(profile.name)}`);

  if (profile.title) {
    lines.push(`TITLE:${escapeText(profile.title)}`);
  }

  // ORG = "Independent" si no hay explicit; pero el design implica freelancer
  lines.push('ORG:Independent');

  if (profile.email) {
    lines.push(`EMAIL;TYPE=INTERNET,PREF:${escapeText(profile.email)}`);
  }
  if (profile.phone) {
    lines.push(`TEL;TYPE=CELL,VOICE:${escapeText(profile.phone)}`);
  }
  if (profile.website) {
    const url = profile.website.startsWith('http')
      ? profile.website
      : `https://${profile.website}`;
    lines.push(`URL:${escapeText(url)}`);
  }
  if (profile.location) {
    // ADR;TYPE=WORK:po-box;extended;street;locality;region;postal;country
    // Best-effort: location string en locality.
    lines.push(`ADR;TYPE=WORK:;;;${escapeText(profile.location)};;;`);
  }
  if (profile.bio) {
    lines.push(`NOTE:${escapeText(profile.bio)}`);
  }

  for (const [kind, handle] of Object.entries(profile.social)) {
    if (!handle) continue;
    const base = SOCIAL_BASE_URL[kind];
    if (!base) continue;
    const url = `${base}${handle}`;
    lines.push(`X-SOCIALPROFILE;TYPE=${kind}:${escapeText(url)}`);
  }

  lines.push(`REV:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '')}`);
  lines.push('END:VCARD');

  return lines.map(foldLine).join('\r\n') + '\r\n';
}

/** Suggested filename for download (e.g. "maya-okafor.vcf"). */
export function vcardFilename(profile: Profile): string {
  const slug = profile.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  return `${slug || profile.username}.vcf`;
}
