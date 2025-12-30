import React, { useState, useEffect, useCallback } from 'react';
import { generateCreativeIdea } from '../services/geminiService';
import { AiState } from '../types';
import { Sparkles, Loader2, ArrowRight, Clock } from 'lucide-react';

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

const AiOracle: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [result, setResult] = useState('');
  const [status, setStatus] = useState<AiState>(AiState.IDLE);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [validationError, setValidationError] = useState('');

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

  const handleConsult = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset validation error
    setValidationError('');

    // Input validation
    const trimmedTopic = topic.trim();

    // Check for empty input
    if (!trimmedTopic) {
      setValidationError('Please enter a vibe or topic');
      return;
    }

    // Check for maximum length
    if (trimmedTopic.length > MAX_INPUT_LENGTH) {
      setValidationError(`Topic must be ${MAX_INPUT_LENGTH} characters or less`);
      return;
    }

    // Check rate limiting
    if (isRateLimited()) {
      setValidationError('Please wait before making another request');
      return;
    }

    // Sanitize input
    const sanitizedTopic = sanitizeInput(trimmedTopic);

    // Check if sanitization removed everything
    if (!sanitizedTopic) {
      setValidationError('Please provide a valid topic');
      return;
    }

    // Check if loading
    if (status === AiState.LOADING) {
      return;
    }

    setStatus(AiState.LOADING);
    setResult('');

    // Save request timestamp for rate limiting
    saveLastRequestTime(Date.now());

    try {
      const slogan = await generateCreativeIdea(sanitizedTopic);
      setResult(slogan);
      setStatus(AiState.SUCCESS);
    } catch (error) {
      // Handle different error types with user-friendly messages
      if (error instanceof Error) {
        const message = error.message.toLowerCase();

        if (message.includes('429') || message.includes('rate limit')) {
          setResult("Too many requests. Please wait a moment.");
        } else if (message.includes('network') || message.includes('fetch')) {
          setResult("Connection issue. Check your network.");
        } else if (message.includes('timeout')) {
          setResult("Request timed out. Try again.");
        } else {
          setResult("Something went wrong. Please try again.");
        }
      } else {
        setResult("Connection issue. Please try again.");
      }
      setStatus(AiState.ERROR);
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

  return (
    <section id="oracle" className="py-24 bg-[#080808] border-t border-white/5">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 border border-samurai-red/30 rounded-full bg-samurai-red/10 mb-6">
          <Sparkles size={14} className="text-samurai-red" />
          <span className="text-xs font-bold text-samurai-red uppercase tracking-wider">Powered by Gemini AI</span>
        </div>
        
        <h2 className="font-display text-4xl md:text-6xl text-white mb-6 uppercase">Lyric Inspiration</h2>
        <p className="text-gray-400 mb-12 max-w-lg mx-auto">
          Need a hook or a concept? Enter a vibe, and our AI will drop a line to kickstart your track.
        </p>

        <form onSubmit={handleConsult} className="relative max-w-md mx-auto mb-12">
          <div className="relative">
            <input
              type="text"
              value={topic}
              onChange={handleInputChange}
              placeholder="Enter a vibe (e.g., 'Late Night', 'Grind', 'Neon City')..."
              maxLength={MAX_INPUT_LENGTH}
              className={`w-full bg-white/5 border text-white px-6 py-4 outline-none transition-colors font-display text-lg tracking-wide placeholder-gray-600 ${
                validationError
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-white/10 focus:border-samurai-red'
              }`}
            />
            {/* Character count indicator */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <span className={`text-xs ${
                topic.length > MAX_INPUT_LENGTH * 0.9 ? 'text-red-400' : 'text-gray-500'
              }`}>
                {topic.length}/{MAX_INPUT_LENGTH}
              </span>
              {cooldownRemaining > 0 && (
                <div className="flex items-center gap-1 text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded">
                  <Clock size={12} />
                  <span>{cooldownRemaining}s</span>
                </div>
              )}
              <button
                type="submit"
                disabled={status === AiState.LOADING || cooldownRemaining > 0}
                className="bg-samurai-red hover:bg-red-700 text-white px-3 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-samurai-red"
              >
                {status === AiState.LOADING ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
              </button>
            </div>
          </div>

          {/* Validation error message */}
          {validationError && (
            <div className="mt-3 text-sm text-red-400 animate-in fade-in slide-in-from-top-2">
              {validationError}
            </div>
          )}

          {/* Cooldown message */}
          {cooldownRemaining > 0 && !validationError && (
            <div className="mt-3 text-sm text-yellow-400 animate-in fade-in slide-in-from-top-2 flex items-center justify-center gap-2">
              <Clock size={14} />
              <span>Wait {cooldownRemaining} second{cooldownRemaining !== 1 ? 's' : ''} before next request</span>
            </div>
          )}
        </form>

        {result && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white/5 border border-samurai-red/30 p-8 relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-1 h-full bg-samurai-red"></div>
               <p className="font-display text-2xl md:text-4xl text-white uppercase italic leading-tight">
                 "{result}"
               </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AiOracle;
