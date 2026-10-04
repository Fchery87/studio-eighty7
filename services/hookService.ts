/**
 * Hook lab client. The backend (server/index.ts) holds the AI keys and picks the provider.
 */

interface GenerateResponse {
  success: boolean;
  data: string;
  provider?: string;
  error?: string;
  message?: string;
}

// Check if running in development mode
const isDevelopment = import.meta.env.DEV === true;

// Conditional logging - only logs in development
const logError = (context: string, error: unknown): void => {
  if (isDevelopment) {
    console.error(`[${context}]`, error);
  }
};

import type { HookRequest } from '@/server/hookOptions';

export interface Hook {
  text: string;
  provider: string;
}

export const generateHook = async (request: HookRequest): Promise<Hook> => {
  // Use proxied API path - Vite proxy handles routing to backend in development
  // In production, the backend should be configured to serve the frontend and handle API routes
  const apiUrl = '/api/generate';

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      let errorMessage = `API Error: ${response.status}`;

      try {
        const errorData: GenerateResponse = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // If JSON parsing fails, use the status code message
      }

      // Handle 429 Too Many Requests specifically
      if (response.status === 429) {
        errorMessage = 'Rate limit exceeded. Please wait before making another request.';
      }

      throw new Error(errorMessage);
    }

    const data: GenerateResponse = await response.json();

    if (!data.success || !data.data) {
      throw new Error(data.message || 'Invalid response from server');
    }

    return { text: data.data, provider: data.provider ?? 'AI' };
  } catch (error) {
    logError('Hook API Error', error);

    // Don't expose internal errors to users
    if (error instanceof Error) {
      // Return user-friendly error message
      throw new Error(error.message);
    }

    // Generic fallback error
    throw new Error("The signal is lost. Check your frequency.");
  }
};
