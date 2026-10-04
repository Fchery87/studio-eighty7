import { NavItem, Stat, Genre } from "./types";

export const NAV_ITEMS: NavItem[] = [
  { label: 'MUSIC', href: '#music' },
  { label: 'ALBUMS', href: '#albums' },
  { label: 'ABOUT', href: '#about' },
  { label: 'CONTACT', href: '#contact' },
];

export const STATS: Stat[] = [
  { label: 'Tracks Produced', value: '870+' },
  { label: 'Global Streams', value: '2M+' },
  { label: 'Years Active', value: '12+' },
];

export const GENRES: Genre[] = [
  { name: 'Hip-Hop', color: '#DC2626' },
  { name: 'Trap', color: '#7C3AED' },
  { name: 'R&B', color: '#0891B2' },
  { name: 'Kompa', color: '#059669' },
  { name: 'Afro', color: '#EA580C' }
];
