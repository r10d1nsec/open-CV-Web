import type { Profile } from '@/types/profile';

/**
 * Port 1:1 de design/_extract/src/data.jsx — persona ejemplo Maya Okafor.
 * Usado en Sprint 0 para renderizar /u/maya sin DB.
 * Será reemplazado por queries Supabase en Sprint 3.
 */
export const mockMaya: Profile = {
  name: 'Maya Okafor',
  initials: 'MO',
  username: 'maya',
  title: 'Design engineer & freelance product designer',
  bio: 'I help early-stage startups ship considered product experiences — bridging brand, interface and front-end code.',
  location: 'London, UK',
  available: true,
  availableLine: 'Booking projects from Sept 2026',
  languages: ['English', 'Yoruba', 'French (B2)'],
  hourly: '£140/hr',
  email: 'hello@mayaokafor.studio',
  phone: '+44 7700 900 184',
  website: 'mayaokafor.studio',
  social: {
    github: 'mayaokafor',
    linkedin: 'maya-okafor',
    twitter: 'maya_okfr',
    figma: 'maya',
    read: 'mayaokafor.studio/notes',
  },
  skills: {
    Design: ['Product design', 'Design systems', 'Brand identity', 'Type & motion'],
    Frontend: ['React + TS', 'Next.js', 'Tailwind', 'Framer Motion', 'GSAP', 'Three.js'],
    Tooling: ['Figma', 'Linear', 'Storybook', 'Webflow'],
  },
  experience: [
    {
      role: 'Freelance Design Engineer',
      org: 'Independent',
      period: '2023 — Present',
      blurb:
        'Selected clients: Linear, Vercel, Arc, Cron. Focus on marketing sites, design systems, and product onboarding.',
      current: true,
    },
    {
      role: 'Senior Product Designer',
      org: 'Linear',
      period: '2021 — 2023',
      blurb: 'Led the Insights and Roadmaps work. Owned the v2 component library and motion language.',
    },
    {
      role: 'Product Designer',
      org: 'Mercury',
      period: '2019 — 2021',
      blurb: 'Designed onboarding, KYC and the Treasury beta. First brand systems engineer hire.',
    },
    {
      role: 'Frontend Engineer',
      org: 'thoughtbot',
      period: '2017 — 2019',
      blurb:
        'Shipped product work for fintech and healthcare clients. Open-source maintainer of suspenders.',
    },
  ],
  projects: [
    {
      title: 'Cargo OS',
      tag: 'Product · 2025',
      blurb: 'Fleet management UI redesign for a Series-B logistics platform.',
      stack: ['Next.js', 'Design system', 'Figma'],
      color: '#3b82f6',
    },
    {
      title: 'Tessera',
      tag: 'Tool · 2024',
      blurb: 'Open-source type-pairing playground. 8k weekly users.',
      stack: ['React', 'OpenType.js'],
      color: '#a855f7',
    },
    {
      title: 'Field Studio',
      tag: 'Brand · 2024',
      blurb: 'Identity & site for a London branding studio. WebGL crests.',
      stack: ['Brand', 'WebGL', 'GSAP'],
      color: '#f97316',
    },
    {
      title: 'Reset Type',
      tag: 'OSS · 2023',
      blurb: 'CSS reset focused on typographic defaults. 4.2k stars.',
      stack: ['CSS', 'OSS'],
      color: '#22c55e',
    },
    {
      title: 'Halo NFC',
      tag: 'Hardware · 2023',
      blurb: 'NFC ring + companion app prototype for personal payments.',
      stack: ['Swift', 'Hardware'],
      color: '#f43f5e',
    },
    {
      title: 'Quiet Hours',
      tag: 'Side · 2023',
      blurb: 'A meditation timer with no streaks and no metrics.',
      stack: ['iOS', 'Brand'],
      color: '#06b6d4',
    },
  ],
  services: [
    {
      id: 's1',
      name: 'Intro call',
      duration: 30,
      price: 'Free',
      blurb: 'Project fit & scoping conversation. No deck required.',
    },
    {
      id: 's2',
      name: 'Design system audit',
      duration: 60,
      price: '£180',
      blurb: 'Live review of tokens, components and gaps. Walkthrough recording included.',
      popular: true,
    },
    {
      id: 's3',
      name: 'Front-end pairing',
      duration: 90,
      price: '£260',
      blurb: 'Pair on a tricky animation, layout or design-engineering problem.',
    },
    {
      id: 's4',
      name: 'Project kickoff (sprint)',
      duration: '5d',
      price: '£8,400',
      blurb: 'One-week embed: brand discovery, system audit & roadmap.',
    },
  ],
  testimonials: [
    {
      quote: '“The clearest design thinker I’ve worked with in a decade. Ships code, too.”',
      author: 'K. Yamada',
      org: 'CPO, Arc',
    },
    {
      quote: '“Maya rebuilt our design system in six weeks. Nothing has fallen over since.”',
      author: 'R. Patel',
      org: 'Eng lead, Cron',
    },
  ],
  accentColor: '#3b82f6',
  fontFamily: 'plus-jakarta',
  layoutVariant: 'default',
  sectionOrder: ['hero', 'skills', 'experience', 'projects', 'testimonials', 'services', 'contact'],
  sectionHidden: [],
  cardStyle: 'aurora',
  cardLinks: [],
};
