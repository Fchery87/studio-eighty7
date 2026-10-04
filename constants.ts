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
  { name: 'Hip-hop', level: 72 },
  { name: 'Trap', level: 48 },
  { name: 'R&B', level: 60 },
  { name: 'Kompa', level: 34 },
  { name: 'Afro', level: 80 },
];
