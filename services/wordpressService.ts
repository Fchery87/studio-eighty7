import {
  MOCK_ALBUMS,
  MOCK_TRACKS,
  MOCK_SERVICES,
  MOCK_ABOUT,
} from './mockData';

// Use proxy in development to avoid CORS issues
const isDev = import.meta.env.DEV;
// Use the "Universal" routing format since Hostinger servers sometimes block the standard /wp-json path
// Use the "Universal" routing format for better server compatibility
const WP_API_BASE = 'https://studioeighty7.com/index.php';
const WP_API_URL = isDev ? '/wp-api' : WP_API_BASE;

// Quiet logging - only log in development when DEBUG is enabled
const debugLog = (...args: any[]) => {
  if (isDev && localStorage.getItem('DEBUG') === 'true') {
    console.log('[WordPress]', ...args);
  }
};

export interface WPPost {
  id: number;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  acf?: any;
  featured_media?: number;
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
      alt_text: string;
    }>;
  };
}

export interface WPAlbum extends WPPost {
  acf: {
    subtitle?: string;
    year?: string;
    tracks?: number;
    album_art?: string;
    spotify_url?: string;
    apple_music_url?: string;
  };
}

export interface WPTrack extends WPPost {
  acf?: {
    artist?: string;
    duration?: string;
    genre?: string;
    audio_url?: WPMediaRef;
    album?: number;
  };
  meta?: Record<string, unknown>;
}

// Fetch albums from WordPress - falls back to mock data on error
export const fetchAlbums = async (): Promise<any[]> => {
  try {
    const response = await fetch(
      `${WP_API_URL}?rest_route=/wp/v2/album&_embed`
    );

    if (response.status === 404) {
      debugLog('Album endpoints not found - using mock data');
      return MOCK_ALBUMS;
    }

    if (!response.ok) throw new Error('Failed to fetch albums');

    const data = await response.json();

    return data.map((album: WPAlbum) => ({
      id: album.id.toString(),
      title: album.title.rendered,
      subtitle: album.acf?.subtitle || 'Studio Eighty7',
      year: album.acf?.year || new Date().getFullYear().toString(),
      cover:
        album._embedded?.['wp:featuredmedia']?.[0]?.source_url ||
        album.acf?.album_art ||
        '/placeholder.svg',
      tracks: album.acf?.tracks || 0,
      description: album.excerpt.rendered.replace(/<[^>]*>/g, ''),
      spotifyUrl: album.acf?.spotify_url || '#',
      appleMusicUrl: album.acf?.apple_music_url || '#',
    }));
  } catch (error) {
    debugLog('Error fetching albums - using mock data');
    return MOCK_ALBUMS;
  }
};

type WPMediaRef =
  | string
  | number
  | {
      url?: string;
      source_url?: string;
      id?: number | string;
      ID?: number | string;
    };

const parseMediaId = (value: number | string | undefined) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && /^\d+$/.test(value)) return parseInt(value, 10);
  return undefined;
};

const fetchMediaUrl = async (mediaId: number): Promise<string> => {
  try {
    const response = await fetch(
      `${WP_API_URL}?rest_route=/wp/v2/media/${mediaId}`
    );
    if (response.ok) {
      const media = await response.json();
      return media.source_url || '';
    }
  } catch (e) {
    debugLog('Failed to resolve audio URL from ID:', mediaId);
  }

  return '';
};

const extractAudioUrlFromContent = (content?: string) => {
  if (!content) return '';

  if (typeof window !== 'undefined' && 'DOMParser' in window) {
    try {
      const doc = new DOMParser().parseFromString(content, 'text/html');
      const audio = doc.querySelector('audio');
      const audioSrc = audio?.getAttribute('src');
      if (audioSrc) return audioSrc;

      const source = doc.querySelector('audio source, source');
      const sourceSrc = source?.getAttribute('src');
      if (sourceSrc) return sourceSrc;

      const link = doc.querySelector(
        'a[href$=".mp3"], a[href$=".wav"], a[href$=".m4a"], a[href$=".ogg"], a[href*=".mp3?"], a[href*=".wav?"], a[href*=".m4a?"], a[href*=".ogg?"]'
      );
      const linkHref = link?.getAttribute('href');
      if (linkHref) return linkHref;
    } catch (e) {
      debugLog('Failed to parse track content for audio URL');
    }
  }

  const match =
    content.match(/<audio[^>]*src=["']([^"']+)["']/i) ||
    content.match(/<source[^>]*src=["']([^"']+)["']/i) ||
    content.match(/href=["']([^"']+\.(mp3|wav|m4a|ogg)(\?[^"']*)?)["']/i);

  return match?.[1] ?? '';
};

// Helper function to resolve audio URL from attachment ID
const resolveAudioUrl = async (
  audioUrl: WPMediaRef | null | undefined
): Promise<string> => {
  if (!audioUrl) return '';

  // If it's already a URL (starts with http), return as-is
  if (typeof audioUrl === 'string') {
    if (audioUrl.startsWith('http') || audioUrl.startsWith('/')) {
      return audioUrl;
    }
  }

  // If it's a number (attachment ID), fetch the media details
  if (
    typeof audioUrl === 'number' ||
    (typeof audioUrl === 'string' && /^\d+$/.test(audioUrl))
  ) {
    const mediaId =
      typeof audioUrl === 'number' ? audioUrl : parseInt(audioUrl, 10);
    return fetchMediaUrl(mediaId);
  }

  if (typeof audioUrl === 'object') {
    if (typeof audioUrl.url === 'string') return audioUrl.url;
    if (typeof audioUrl.source_url === 'string') return audioUrl.source_url;

    const mediaId =
      parseMediaId(audioUrl.ID) ?? parseMediaId(audioUrl.id);
    if (mediaId !== undefined) {
      return fetchMediaUrl(mediaId);
    }
  }

  return '';
};

// Fetch tracks from WordPress - falls back to mock data on error
export const fetchTracks = async (): Promise<any[]> => {
  try {
    const response = await fetch(
      `${WP_API_URL}?rest_route=/wp/v2/track&_embed&per_page=20`
    );

    if (response.status === 404) {
      debugLog('Track endpoints not found - using mock data');
      return MOCK_TRACKS;
    }

    if (!response.ok) throw new Error('Failed to fetch tracks');

    const data = await response.json();

    // Process tracks and resolve audio URLs
    const tracksWithUrls = await Promise.all(
      data.map(async (track: WPTrack) => {
        const contentAudioUrl = extractAudioUrlFromContent(
          track.content?.rendered
        );
        const rawAudioUrl =
          track.acf?.audio_url ?? track.meta?.audio_url ?? '';
        const audioUrl =
          contentAudioUrl ||
          (rawAudioUrl
            ? await resolveAudioUrl(rawAudioUrl as WPMediaRef)
            : '');
        return {
          id: track.id.toString(),
          title: track.title.rendered,
          artist: track.acf?.artist || 'Tek-Domain',
          duration: track.acf?.duration || '3:00',
          cover:
            track._embedded?.['wp:featuredmedia']?.[0]?.source_url ||
            '/placeholder.svg',
          genre: track.acf?.genre || 'Hip-Hop',
          audioUrl,
        };
      })
    );

    return tracksWithUrls;
  } catch (error) {
    debugLog('Error fetching tracks - using mock data');
    return MOCK_TRACKS;
  }
};

// Fetch services from WordPress - falls back to mock data on error
export const fetchServices = async (): Promise<any[]> => {
  try {
    const response = await fetch(
      `${WP_API_URL}?rest_route=/wp/v2/service&per_page=10`
    );

    if (response.status === 404) {
      debugLog('Service endpoints not found - using mock data');
      return MOCK_SERVICES;
    }

    if (!response.ok) throw new Error('Failed to fetch services');

    const data = await response.json();

    return data.map((service: WPPost, index: number) => ({
      id: service.id.toString(),
      title: service.title.rendered,
      description: service.excerpt.rendered.replace(/<[^>]*>/g, ''),
      icon: ['music', 'sliders', 'headphones'][index % 3],
    }));
  } catch (error) {
    debugLog('Error fetching services - using mock data');
    return MOCK_SERVICES;
  }
};

// Fetch about page content - falls back to mock data on error
export const fetchAboutContent = async () => {
  try {
    const response = await fetch(`${WP_API_URL}/pages?slug=about`);

    if (response.status === 404) {
      debugLog('About page not found - using mock data');
      return MOCK_ABOUT;
    }

    if (!response.ok) throw new Error('Failed to fetch about page');

    const data = await response.json();
    const page = data[0];

    return {
      title: page.title.rendered,
      content: page.content.rendered,
      excerpt: page.excerpt.rendered,
    };
  } catch (error) {
    debugLog('Error fetching about content - using mock data');
    return MOCK_ABOUT;
  }
};
