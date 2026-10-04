import { GoogleGenAI } from '@google/genai';

export interface HookProvider {
  name: 'DeepSeek' | 'Gemini';
  generate: (prompt: string) => Promise<string>;
}

export class ProviderError extends Error {
  constructor(
    readonly provider: HookProvider['name'],
    readonly status: number,
    message: string
  ) {
    super(`${provider} ${status}: ${message}`);
  }
}

export const hookPrompt = (topic: string) =>
  `You are a legendary music producer and lyricist for Studio Eighty7.
The user needs a song concept, title, or a one-line lyric hook for: "${topic}".
Provide a punchy, moody, or hard-hitting creative text snippet.
Keep it under 20 words. Focus on rhythm, emotion, and grit. Reply with the hook only.`;

const deepSeek = (apiKey: string): HookProvider => ({
  name: 'DeepSeek',
  generate: async (prompt) => {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'deepseek-flash',
        messages: [{ role: 'user', content: prompt }],
        // A 20-word hook does not need chain-of-thought; thinking is on by default
        thinking: { type: 'disabled' },
        max_tokens: 100,
      }),
      signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok) {
      throw new ProviderError('DeepSeek', response.status, (await response.text()).slice(0, 300));
    }
    const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
    return (data.choices?.[0]?.message?.content ?? '').trim();
  },
});

const gemini = (apiKey: string): HookProvider => {
  // Pinned so a GOOGLE_GEMINI_BASE_URL in the shell cannot reroute requests away from Google
  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: { baseUrl: 'https://generativelanguage.googleapis.com' },
  });
  return {
    name: 'Gemini',
    generate: async (prompt) => {
      try {
        const response = await ai.models.generateContent({ model: 'gemini-3.6-flash', contents: prompt });
        return (response.text ?? '').trim();
      } catch (error) {
        const status = (error as { status?: number }).status ?? 500;
        throw new ProviderError('Gemini', status, error instanceof Error ? error.message : String(error));
      }
    },
  };
};

// Tried in this order; a provider without a key is left out
export const configuredProviders = (env: NodeJS.ProcessEnv): HookProvider[] =>
  [
    env.DEEPSEEK_API_KEY ? deepSeek(env.DEEPSEEK_API_KEY) : null,
    env.GEMINI_API_KEY ? gemini(env.GEMINI_API_KEY) : null,
  ].filter((provider): provider is HookProvider => provider !== null);
