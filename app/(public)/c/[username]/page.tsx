import { SITE_URL as SITE } from '@/lib/site';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProfileByUsername } from '@/lib/profile-store';
import { themeVars } from '@/lib/theme';
import { DigitalCard, type CardData } from '@/components/card/digital-card';
import type { Profile, SocialKind } from '@/types/profile';

type Params = { username: string };
export const dynamic = 'force-dynamic';


export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  if (!profile) return { title: 'Folio · card no encontrada' };
  return {
    title: `${profile.name} · Tarjeta digital`,
    description: `Guarda el contacto de ${profile.name}, escríbele o agenda una cita.`,
    openGraph: { title: `${profile.name} · ${profile.title}`, description: profile.bio, type: 'profile' },
  };
}

function digits(s: string): string {
  return s.replace(/[^\d+]/g, '').replace(/^00/, '+');
}

const SOCIAL_MAP: Record<SocialKind, { icon: string; base: (h: string) => string }> = {
  github: { icon: 'github', base: (h) => `https://github.com/${h}` },
  linkedin: { icon: 'linkedin', base: (h) => `https://linkedin.com/in/${h}` },
  twitter: { icon: 'x', base: (h) => `https://x.com/${h}` },
  figma: { icon: 'figma', base: (h) => `https://figma.com/@${h}` },
  read: { icon: 'web', base: (h) => `https://read.cv/${h}` },
  website: { icon: 'web', base: (h) => (h.startsWith('http') ? h : `https://${h}`) },
  custom: { icon: 'link', base: (h) => (h.startsWith('http') ? h : `https://${h}`) },
};

function buildSocials(profile: Profile): { icon: string; url: string }[] {
  const out: { icon: string; url: string }[] = [];
  (Object.entries(profile.social) as [SocialKind, string | undefined][]).forEach(([kind, handle]) => {
    if (!handle) return;
    const m = SOCIAL_MAP[kind];
    if (m) out.push({ icon: m.icon, url: m.base(handle) });
  });
  return out;
}

export default async function DigitalCardPage({ params }: { params: Promise<Params> }) {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  if (!profile) notFound();

  const waNumber = digits(profile.whatsapp ?? profile.phone ?? '');
  const phoneDigits = profile.phone ? digits(profile.phone) : '';

  const data: CardData = {
    name: profile.name,
    initials: profile.initials,
    title: profile.title,
    location: profile.location,
    available: profile.available,
    cardStyle: profile.cardStyle,
    username,
    vcardUrl: `/api/card/${username}/vcard`,
    qrPngUrl: `/api/card/${username}/qr?format=png&width=512`,
    qrSvgUrl: `/api/card/${username}/qr?format=svg`,
    cardUrl: `${SITE}/c/${username}`,
    bookingUrl: `/${username}/booking`,
    contactUrl: `/${username}/contact`,
    links: [...profile.cardLinks],
    socials: buildSocials(profile),
  };
  if (profile.company) data.company = profile.company;
  if (profile.availableLine) data.availableLine = profile.availableLine;
  if (profile.avatarUrl) data.avatarUrl = profile.avatarUrl;
  if (profile.cardCoverUrl) data.cardCoverUrl = profile.cardCoverUrl;
  if (profile.cvUrl) data.cvUrl = profile.cvUrl;
  if (waNumber) {
    const msg = profile.whatsappMessage ? `?text=${encodeURIComponent(profile.whatsappMessage)}` : '';
    data.waUrl = `https://wa.me/${waNumber.replace(/^\+/, '')}${msg}`;
  }
  if (phoneDigits) {
    data.telUrl = `tel:${phoneDigits}`;
    data.smsUrl = `sms:${phoneDigits}`;
  }
  if (profile.email) data.mailUrl = `mailto:${profile.email}`;

  return (
    <div style={themeVars(profile.accentColor, profile.fontFamily)}>
      <DigitalCard data={data} />
    </div>
  );
}
