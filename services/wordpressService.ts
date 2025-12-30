import {
  MOCK_ALBUMS,
  MOCK_TRACKS,
  MOCK_SERVICES,
  MOCK_ABOUT,
} from './mockData';

// Use proxy in development to avoid CORS issues
const isDev = import.meta.env.DEV;
const WP_API_URL = isDev
  ? '/wp-api'
  : 'https://studioeighty7.com/wp-json/wp/v2';

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
  acf: {
    artist?: string;
    duration?: string;
    genre?: string;
    audio_url?: string;
    album?: number;
  };
}

// Fetch albums from WordPress - falls back to mock data on error
export const fetchAlbums = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${WP_API_URL}/album?_embed`);

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

// Fetch tracks from WordPress - falls back to mock data on error
export const fetchTracks = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${WP_API_URL}/track?_embed&per_page=20`);

    if (response.status === 404) {
      debugLog('Track endpoints not found - using mock data');
      return MOCK_TRACKS;
    }

    if (!response.ok) throw new Error('Failed to fetch tracks');

    const data = await response.json();

    return data.map((track: WPTrack) => ({
      id: track.id.toString(),
      title: track.title.rendered,
      artist: track.acf?.artist || 'Tek-Domain',
      duration: track.acf?.duration || '3:00',
      cover:
        track._embedded?.['wp:featuredmedia']?.[0]?.source_url ||
        '/placeholder.svg',
      genre: track.acf?.genre || 'Hip-Hop',
      audioUrl: track.acf?.audio_url || '',
    }));
  } catch (error) {
    debugLog('Error fetching tracks - using mock data');
    return MOCK_TRACKS;
  }
};

// Fetch services from WordPress - falls back to mock data on error
export const fetchServices = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${WP_API_URL}/service?per_page=10`);

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
