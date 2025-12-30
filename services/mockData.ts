// Mock data for development when WordPress API is not available

// SVG placeholder generator - creates local placeholders without network requests
const createPlaceholder = (text: string, size = 500) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="100%" height="100%" fill="#050505"/>
    <rect x="10" y="10" width="${size - 20}" height="${
    size - 20
  }" fill="none" stroke="#DC2626" stroke-width="2"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#DC2626" font-family="sans-serif" font-size="32" font-weight="bold">${text}</text>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

export const MOCK_ALBUMS = [
  {
    id: '1',
    title: 'Katana Dreams',
    subtitle: 'Tek-Domain Production',
    year: '2024',
    cover: createPlaceholder('KATANA'),
    tracks: 12,
    description:
      'A sonic journey through the streets, featuring hard-hitting beats and raw lyrics.',
    spotifyUrl: '#',
    appleMusicUrl: '#',
  },
  {
    id: '2',
    title: 'Blade Runner',
    subtitle: 'Studio Eighty7',
    year: '2023',
    cover: createPlaceholder('BLADE'),
    tracks: 10,
    description: 'Dark, atmospheric hip-hop with futuristic production.',
    spotifyUrl: '#',
    appleMusicUrl: '#',
  },
  {
    id: '3',
    title: 'Ronin Mode',
    subtitle: 'Tek-Domain',
    year: '2023',
    cover: createPlaceholder('RONIN'),
    tracks: 8,
    description: 'Aggressive bars over experimental beats.',
    spotifyUrl: '#',
    appleMusicUrl: '#',
  },
  {
    id: '4',
    title: 'Shadow Warrior',
    subtitle: 'Studio Eighty7',
    year: '2022',
    cover: createPlaceholder('SHADOW'),
    tracks: 15,
    description: 'Classic boom-bap meets modern production.',
    spotifyUrl: '#',
    appleMusicUrl: '#',
  },
];

export const MOCK_TRACKS = [
  {
    id: '1',
    title: 'Katana Sharp',
    artist: 'Tek-Domain',
    duration: '3:45',
    cover: createPlaceholder('TRACK 1'),
    genre: 'Hip-Hop',
    audioUrl: '',
  },
  {
    id: '2',
    title: 'Blade Dance',
    artist: 'Tek-Domain',
    duration: '4:12',
    cover: createPlaceholder('TRACK 2'),
    genre: 'Hip-Hop',
    audioUrl: '',
  },
  {
    id: '3',
    title: 'Ronin Rise',
    artist: 'Tek-Domain',
    duration: '3:28',
    cover: createPlaceholder('TRACK 3'),
    genre: 'Hip-Hop',
    audioUrl: '',
  },
  {
    id: '4',
    title: 'Shadow Walk',
    artist: 'Tek-Domain',
    duration: '3:55',
    cover: createPlaceholder('TRACK 4'),
    genre: 'Hip-Hop',
    audioUrl: '',
  },
  {
    id: '5',
    title: 'Warrior Code',
    artist: 'Tek-Domain',
    duration: '4:02',
    cover: createPlaceholder('TRACK 5'),
    genre: 'Hip-Hop',
    audioUrl: '',
  },
];

export const MOCK_SERVICES = [
  {
    id: '1',
    title: 'Music Production',
    description:
      'Full-scale beat production from concept to completion. We craft custom instrumentals tailored to your vision, genre, and style.',
    icon: 'music',
  },
  {
    id: '2',
    title: 'Mixing & Mastering',
    description:
      'Professional mixing and mastering services to give your tracks the polished, radio-ready sound they deserve.',
    icon: 'sliders',
  },
  {
    id: '3',
    title: 'Artist Development',
    description:
      'Comprehensive artist development including branding, sound design, and career guidance for emerging talent.',
    icon: 'headphones',
  },
];

export const MOCK_ABOUT = {
  title: 'About Studio Eighty7',
  content:
    '<p>Studio Eighty7 is a state-of-the-art recording studio and production house founded by Tek-Domain. We specialize in hip-hop, R&B, and electronic music production, delivering high-quality sound to artists worldwide.</p><p>Our mission is simple: provide professional-grade production services that help artists realize their creative vision without compromise.</p>',
  excerpt: 'State-of-the-art recording studio and production house.',
};
