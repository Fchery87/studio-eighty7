// Shared by the server (validation, prompt) and the page (pickers). Keep it dependency-free.

export const HOOK_GENRES = {
  any: { label: 'Any genre', guide: 'Pick the genre the theme fits best and commit to its sound.' },
  'hip-hop': { label: 'Hip-hop', guide: 'Confident and conversational. Bars that bounce, internal rhyme, a line people quote.' },
  trap: { label: 'Trap', guide: 'Short, repetitive, chant-able phrases over hi-hat triplets. Ad-libs in parentheses are welcome.' },
  drill: { label: 'Drill', guide: 'Cold, clipped, sliding cadence. Dark but specific street detail, no glorified violence against real people.' },
  'boom-bap': { label: 'Boom bap', guide: 'Head-nod rhythm, wordplay and multisyllabic rhyme, a scratch-ready title phrase.' },
  rnb: { label: 'R&B', guide: 'Intimate and vulnerable. Open vowels a singer can stretch, room for runs.' },
  'neo-soul': { label: 'Neo-soul', guide: 'Warm, poetic but plain-spoken, laid-back phrasing behind the beat.' },
  pop: { label: 'Pop', guide: 'Huge, simple, instantly singable. Short words, a title phrase repeated for the whole room.' },
  afrobeats: { label: 'Afrobeats', guide: 'Call-and-response, joyful or seductive, light Nigerian Pidgin where it fits.' },
  amapiano: { label: 'Amapiano', guide: 'Hypnotic and repetitive over log drums, chant-like phrases, a little South African slang where natural.' },
  dancehall: { label: 'Dancehall', guide: 'Patois flavor, rhythmic and bouncy, made for the dance floor and a crowd shout-back.' },
  reggae: { label: 'Reggae', guide: 'Offbeat feel, conscious or loving, roots imagery and a steady, easy melody.' },
  reggaeton: { label: 'Reggaeton', guide: 'Dembow bounce, Spanish or Spanglish, flirtatious and confident.' },
  kompa: { label: 'Kompa', guide: 'Warm, romantic, made for slow dancing. A Haitian Creole phrase is welcome, spelled correctly (cheri, mwen renmen w, pa kite m).' },
  zouk: { label: 'Zouk', guide: 'Sensual and tender, French Caribbean flavor, a little Creole or French where it lands naturally.' },
  soca: { label: 'Soca', guide: 'Carnival energy, jump-and-wave commands, Trinidadian slang, pure celebration.' },
  gospel: { label: 'Gospel', guide: 'Uplifting testimony, call-and-response for a choir, faith shown through a real-life moment.' },
  country: { label: 'Country', guide: 'Storytelling with small-town detail, a clever turn of phrase in the title.' },
  rock: { label: 'Rock', guide: 'Raw, defiant, shout-along chorus with short punchy words.' },
  edm: { label: 'EDM', guide: 'Few words, big repetition, a phrase built to drop into. Leave space for the build.' },
} as const;

export type HookGenre = keyof typeof HOOK_GENRES;
export const HOOK_GENRE_IDS = Object.keys(HOOK_GENRES) as [HookGenre, ...HookGenre[]];

export const HOOK_BARS = [2, 4, 8, 16] as const;
export type HookBars = (typeof HOOK_BARS)[number];

export interface HookRequest {
  topic: string;
  genre: HookGenre;
  bars: HookBars;
}
