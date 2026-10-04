import { GoogleGenAI } from '@google/genai';
import type { HookMessages } from './hookPrompt.js';

export interface HookProvider {
  name: 'DeepSeek' | 'Gemini';
  generate: (messages: HookMessages) => Promise<string>;
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

const deepSeek = (apiKey: string): HookProvider => ({
  name: 'DeepSeek',
  generate: async ({ system, user }) => {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'deepseek-flash',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        // A 20-word hook does not need chain-of-thought; thinking is on by default
        thinking: { type: 'disabled' },
        // DeepSeek recommends a high temperature for creative writing
        temperature: 1.3,
        max_tokens: 600,
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
    generate: async ({ system, user }) => {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: user,
          config: { systemInstruction: system, temperature: 1.2 },
        });
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
