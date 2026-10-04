import React, { useState, useEffect, useCallback, useRef } from 'react';
import { generateHook } from '../services/hookService';
import { HOOK_BARS, HOOK_GENRES, HOOK_GENRE_IDS, type HookBars, type HookGenre } from '@/server/hookOptions';

// Rate limiting configuration
const RATE_LIMIT_COOLDOWN = 5000; // 5 seconds
const STORAGE_KEY = 'ai-oracle-last-request';
const MAX_INPUT_LENGTH = 200;

// Sanitize input to prevent prompt injection and strip dangerous characters
const sanitizeInput = (input: string): string => {
  // Trim whitespace
  let sanitized = input.trim();

  // Remove potentially dangerous characters and patterns
  // This strips common prompt injection patterns like system instructions
  const dangerousPatterns = [
    /<\s*script.*?>.*?<\s*\/\s*script\s*>/gis, // Script tags
    /javascript:/gis, // JavaScript protocol
    /data:/gis, // Data protocol
    /vbscript:/gis, // VBScript protocol
    /on\w+\s*=/gis, // Event handlers like onclick=
    /<\s*iframe.*?>.*?<\s*\/\s*iframe\s*>/gis, // Iframes
    /<\s*embed.*?>/gis, // Embed tags
    /<\s*object.*?>/gis, // Object tags
    /--/gis, // SQL comment style
    /\/\*.*?\*\//gs, // CSS/JS comments
    /\${.*?}/gs, // Template literals
    /\\[\\nrt]/gs, // Escape sequences
    /[\x00-\x1F\x7F]/g, // Control characters (except tab, newline, etc.)
  ];

  for (const pattern of dangerousPatterns) {
    sanitized = sanitized.replace(pattern, '');
  }

  // Normalize multiple spaces to single space
  sanitized = sanitized.replace(/\s+/g, ' ');

  return sanitized;
};

// Get last request timestamp from localStorage
const getLastRequestTime = (): number | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? parseInt(stored, 10) : null;
  } catch {
    // localStorage may be disabled
    return null;
  }
};

// Save last request timestamp to localStorage
const saveLastRequestTime = (timestamp: number): void => {
  try {
    localStorage.setItem(STORAGE_KEY, timestamp.toString());
  } catch {
    // localStorage may be disabled, silently fail
  }
};

// Clear rate limit storage
const clearRateLimitStorage = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // localStorage may be disabled, silently fail
  }
};

type HookStatus = 'idle' | 'loading' | 'done' | 'error';

const AiOracle: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [result, setResult] = useState('');
  const [provider, setProvider] = useState('');
  const [genre, setGenre] = useState<HookGenre>('any');
  const [bars, setBars] = useState<HookBars>(4);
  const [madeFor, setMadeFor] = useState('');
  const [status, setStatus] = useState<HookStatus>('idle');
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [validationError, setValidationError] = useState('');
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(copiedTimer.current), []);

  // Update cooldown timer
  useEffect(() => {
    if (cooldownRemaining > 0) {
      const timer = setInterval(() => {
        setCooldownRemaining((prev) => {
          const newRemaining = prev - 1;
          if (newRemaining <= 0) {
            clearRateLimitStorage();
          }
          return newRemaining;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [cooldownRemaining]);

  // Check if rate limited
  const isRateLimited = useCallback((): boolean => {
    const lastRequest = getLastRequestTime();
    if (!lastRequest) return false;

    const now = Date.now();
    const timeSinceLastRequest = now - lastRequest;

    if (timeSinceLastRequest < RATE_LIMIT_COOLDOWN) {
      const remaining = Math.ceil((RATE_LIMIT_COOLDOWN - timeSinceLastRequest) / 1000);
      setCooldownRemaining(remaining);
      return true;
    }

    return false;
  }, []);

  const generate = async () => {
    // Reset validation error
    setValidationError('');

    // Input validation
    const trimmedTopic = topic.trim();

    // Check for empty input
    if (!trimmedTopic) {
      setValidationError('Type a mood or a place first.');
      return;
    }

    // Check for maximum length
    if (trimmedTopic.length > MAX_INPUT_LENGTH) {
      setValidationError(`Topic must be ${MAX_INPUT_LENGTH} characters or less`);
      return;
    }

    // Check rate limiting
    if (isRateLimited()) {
      setValidationError('Wait a few seconds before asking again.');
      return;
    }

    // Sanitize input
    const sanitizedTopic = sanitizeInput(trimmedTopic);

    // Check if sanitization removed everything
    if (!sanitizedTopic) {
      setValidationError('That input could not be used. Try a mood or a place in plain words.');
      return;
    }

    // Check if loading
    if (status === 'loading') {
      return;
    }

    setStatus('loading');
    setResult('');

    // Save request timestamp for rate limiting
    saveLastRequestTime(Date.now());

    try {
      const hook = await generateHook({ topic: sanitizedTopic, genre, bars });
      setResult(hook.text);
      setProvider(hook.provider);
      setMadeFor(`${genre === 'any' ? 'Any genre' : HOOK_GENRES[genre].label}, ${bars} bars`);
      setStatus('done');
    } catch (error) {
      // Handle different error types with user-friendly messages
      if (error instanceof Error) {
        const message = error.message.toLowerCase();

        if (message.includes('429') || message.includes('rate limit')) {
          setResult("Too many requests. Wait a moment, then try again.");
        } else if (message.includes('network') || message.includes('fetch')) {
          setResult("Could not reach the server. Check your connection and try again.");
        } else if (message.includes('timeout')) {
          setResult("The request timed out. Try again.");
        } else {
          setResult("Something went wrong on our side. Try again in a minute.");
        }
      } else {
        setResult("Could not reach the server. Check your connection and try again.");
      }
      setStatus('error');
    }
  };

  // Handle input change with character count and validation
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // Enforce max length
    if (newValue.length > MAX_INPUT_LENGTH) {
      return;
    }

    setTopic(newValue);

    // Clear validation error when user starts typing
    if (newValue.trim() && validationError) {
      setValidationError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generate();
  };

  const copyHook = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      window.clearTimeout(copiedTimer.current);
      copiedTimer.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setValidationError('Could not copy. Select the text and copy it by hand.');
    }
  };

  const loading = status === 'loading';

  return (
    <section id="write" className="py-20 md:py-28">
      <div className="mx-auto max-w-[1200px] px-6">
        <h2 className="display text-4xl md:text-6xl mb-6">Hook lab</h2>
        <p className="text-dust mb-10 max-w-[65ch]">
          Pick a genre and a length, type a mood or a place, and get a hook to take into the booth.
        </p>

        <form onSubmit={handleSubmit} className="max-w-[640px]">
          <div className="mb-6 flex flex-col gap-6 sm:flex-row sm:items-end">
            <div>
              <label htmlFor="hook-genre" className="mb-2 block text-sm text-dust">
                Genre
              </label>
              <select
                id="hook-genre"
                value={genre}
                onChange={(e) => setGenre(e.target.value as HookGenre)}
                className="w-full rounded-md border border-line bg-panel px-4 py-3 text-bone sm:w-56"
              >
                {HOOK_GENRE_IDS.map((id) => (
                  <option key={id} value={id}>
                    {HOOK_GENRES[id].label}
                  </option>
                ))}
              </select>
            </div>
            <fieldset>
              <legend className="mb-2 text-sm text-dust">Length in bars</legend>
              <div className="flex flex-wrap gap-2">
                {HOOK_BARS.map((option) => (
                  <label
                    key={option}
                    className={`data min-w-12 cursor-pointer rounded-md border px-4 py-3 text-center text-base has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-amber has-[:focus-visible]:outline-offset-2 ${
                      bars === option ? 'border-bone bg-bone text-walnut' : 'border-line text-bone hover:border-dust'
                    }`}
                  >
                    <input
                      type="radio"
                      name="hook-bars"
                      value={option}
                      checked={bars === option}
                      onChange={() => setBars(option)}
                      className="sr-only"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
          <label htmlFor="hook-topic" className="mb-2 block text-sm text-dust">
            Mood or place
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              id="hook-topic"
              type="text"
              value={topic}
              onChange={handleInputChange}
              placeholder="First big check, Lagos rooftop, she left on read"
              maxLength={MAX_INPUT_LENGTH}
              aria-invalid={Boolean(validationError)}
              aria-describedby="hook-help"
              className="flex-1 rounded-md border border-line bg-panel px-4 py-3 text-bone placeholder:text-dust"
            />
            <button
              type="submit"
              disabled={loading || cooldownRemaining > 0}
              className="rounded-md bg-bone px-6 py-3 font-semibold text-walnut disabled:opacity-50"
            >
              {loading ? 'Writing…' : 'Write a hook'}
            </button>
          </div>
          <div id="hook-help" className="mt-2 flex justify-between gap-4 text-sm text-dust">
            <span role="alert">
              {validationError ||
                (cooldownRemaining > 0 ? `Ready again in ${cooldownRemaining}s.` : '')}
            </span>
            <span className="data">
              {topic.length}/{MAX_INPUT_LENGTH}
            </span>
          </div>
        </form>

        <div aria-live="polite" className="mt-10 max-w-[900px]">
          {status === 'done' && (
            <div className="rounded-xl border border-line bg-panel p-6 md:p-8">
              <ol className="space-y-2">
                {result.split('\n').map((line, i) => (
                  <li key={i} className="grid grid-cols-[2rem_1fr] items-baseline gap-3">
                    <span className="data text-sm text-dust">{i + 1}</span>
                    <span className="display text-xl md:text-2xl leading-[1.2]">
                      {line.split(/(\([^)]*\))/).map((part, j) =>
                        part.startsWith('(') ? (
                          <span key={j} className="text-dust">
                            {part}
                          </span>
                        ) : (
                          part
                        )
                      )}
                    </span>
                  </li>
                ))}
              </ol>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={copyHook}
                  className="rounded-md border border-bone px-5 py-2 font-semibold"
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button
                  type="button"
                  onClick={generate}
                  className="rounded-md px-5 py-2 font-semibold text-amber hover:underline"
                >
                  Try another
                </button>
              </div>
              <p className="mt-6 text-sm text-dust">{madeFor}. Written by {provider}.</p>
            </div>
          )}
          {status === 'error' && <p className="text-bone">{result}</p>}
        </div>
      </div>
    </section>
  );
};

export default AiOracle;
