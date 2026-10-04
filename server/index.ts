import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { configuredProviders, ProviderError } from './hookProviders.js';
import { hookMessages } from './hookPrompt.js';
import { z } from 'zod';
import dotenv from 'dotenv';

// server/.env wins over the shell, so a GEMINI_API_KEY exported for another tool cannot leak in
dotenv.config({ override: true });

const PORT = process.env.PORT || 8787;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  xssFilter: true,
}));

// CORS configuration
app.use(cors({
  origin: FRONTEND_URL,
  credentials: false, // No cookies needed for this simple proxy
  methods: ['POST'],
  allowedHeaders: ['Content-Type', 'Accept'],
  maxAge: 86400, // 24 hours
}));

// Body parser with size limits
app.use(express.json({ limit: '10kb' }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// Rate limiting configuration
const generateRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests per window per IP
  standardHeaders: false,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    console.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
    });
  },
  skip: (req: Request) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  },
});

// Rate limiting for contact form (more restrictive to prevent spam)
const contactRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 messages per hour per IP
  standardHeaders: false,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    console.warn(`Contact form rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many messages',
      message: 'You can only send 3 messages per hour. Please try again later.',
    });
  },
  skip: (req: Request) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  },
});

// Validation schema using Zod
const GenerateRequestSchema = z.object({
  topic: z
    .string()
    .min(1, 'Topic cannot be empty')
    .max(200, 'Topic must be 200 characters or less')
    .trim()
    .transform((val) => {
      // Basic sanitization: remove potentially dangerous characters
      return val.replace(/[<>]/g, '');
    }),
});

// Contact form validation schema
const ContactRequestSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be 100 characters or less')
    .trim()
    .transform((val) => {
      // Sanitize: remove any HTML/script tags and limit to alphanumeric + spaces + basic punctuation
      return val
        .replace(/[<>]/g, '') // Remove angle brackets
        .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
        .trim();
    })
    .refine((val) => /^[\p{L}\p{M}0-9\s\-\.'’]+$/u.test(val), {
      message: 'Name contains invalid characters',
    }),
  email: z
    .string()
    .min(1, 'Email is required')
    .max(255, 'Email is too long')
    .trim()
    .toLowerCase()
    .transform((val) => {
      // Basic sanitization for email
      return val.replace(/[<>]/g, '').trim().toLowerCase();
    })
    .refine((val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: 'Please provide a valid email address',
    }),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be 1000 characters or less')
    .trim()
    .transform((val) => {
      // Sanitize: remove dangerous characters but preserve formatting
      return val
        .replace(/</g, '&lt;') // HTML encode <
        .replace(/>/g, '&gt;') // HTML encode >
        .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
        .trim();
    }),
  service: z.string().max(100).optional(),
});

const providers = configuredProviders(process.env);
if (providers.length === 0) {
  console.warn('No DEEPSEEK_API_KEY or GEMINI_API_KEY set; the hook lab will answer 503.');
}

// Health check endpoint (no rate limiting)
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'studio-eighty7-backend',
  });
});

// Generate endpoint with rate limiting and validation
// Models sometimes add quotes, labels or blank lines despite the prompt
const cleanHook = (raw: string) =>
  raw
    .split('\n')
    // Double quotes only: a trailing apostrophe is slang ("rollin'"), not a quote
    .map((line) => line.trim().replace(/^["“”]+|["“”]+$/g, '').trim())
    .filter((line) => line && !/^(hook|chorus|title)\s*:?$/i.test(line))
    .slice(0, 6)
    .join('\n');

app.post('/api/generate', generateRateLimiter, async (req: Request, res: Response) => {
  const parsed = GenerateRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: 'Validation error',
      message: parsed.error.issues[0]?.message || 'Invalid request body',
    });
    return;
  }

  if (providers.length === 0) {
    res.status(503).json({ error: 'Service unavailable', message: 'The hook lab is not set up yet.' });
    return;
  }

  const messages = hookMessages(parsed.data.topic);
  let rateLimited = false;
  for (const provider of providers) {
    try {
      const hook = cleanHook(await provider.generate(messages));
      if (!hook) throw new ProviderError(provider.name, 502, 'empty response');
      res.status(200).json({ success: true, data: hook, provider: provider.name });
      return;
    } catch (error) {
      console.error(`[hook] ${provider.name} failed:`, error instanceof Error ? error.message : error);
      if (error instanceof ProviderError) {
        if (error.status === 429) rateLimited = true;
        if ([400, 401, 402, 403].includes(error.status)) {
          console.error(`[hook] Check ${provider.name === 'Gemini' ? 'GEMINI_API_KEY' : 'DEEPSEEK_API_KEY'} in server/.env and that the account has credit.`);
        }
      }
    }
  }

  if (rateLimited) {
    res.status(429).json({ error: 'Rate limit exceeded', message: 'Too many requests. Please try again later.' });
    return;
  }
  res.status(502).json({ error: 'Upstream error', message: 'No hook writer is available right now.' });
});

// Contact form endpoint with rate limiting and validation
app.post('/api/contact', contactRateLimiter, async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = ContactRequestSchema.parse(req.body);

    const { name, email, message, service } = validatedData;

    // Log submission (without exposing sensitive data)
    console.log(`Contact form submission from: ${email} (${name})`);

    // TODO: Implement actual email delivery
    // Options:
    // 1. Nodemailer with SMTP (requires SMTP credentials)
    // 2. SendGrid (requires SENDGRID_API_KEY)
    // 3. Resend (requires RESEND_API_KEY)
    // 4. Mailgun (requires MAILGUN_API_KEY)
    //
    // Example with Nodemailer:
    // const transporter = nodemailer.createTransport({
    //   host: process.env.SMTP_HOST,
    //   port: process.env.SMTP_PORT || 587,
    //   secure: false,
    //   auth: {
    //     user: process.env.SMTP_USER,
    //     pass: process.env.SMTP_PASS,
    //   },
    // });
    //
    // await transporter.sendMail({
    //   from: process.env.SMTP_FROM,
    //   to: 'info@studioeighty7.com',
    //   subject: `New Contact Form Message from ${name}`,
    //   text: `From: ${name} (${email})\n\nMessage:\n${message}`,
    // });

    // For now, log the data for manual processing
    console.log(`Contact form message received:`, {
      timestamp: new Date().toISOString(),
      from: email,
      name: name,
      service: service,
      messageLength: message.length,
    });

    // Return successful response
    res.status(200).json({
      success: true,
      message: 'Message received successfully',
    });

  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      res.status(400).json({
        error: 'Validation error',
        field: firstError.path[0] || 'unknown',
        message: firstError.message || 'Invalid request body',
      });
      return;
    }

    // Handle other errors
    console.error('Error processing contact form:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Unable to send message. Please try again later.',
    });
  }
});

// 404 handler for undefined routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not found',
    message: 'The requested endpoint does not exist',
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: 'The signal is lost. Check your frequency.',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║           Studio Eighty7 Backend Server                ║
╠══════════════════════════════════════════════════════════╣
║  Status: Running                                        ║
║  Port: ${PORT.toString().padEnd(49)}║
║  Environment: ${process.env.NODE_ENV || 'development'.padEnd(39)}║
║  CORS Origin: ${FRONTEND_URL.padEnd(40)}║
║  Rate Limits:                                           ║
║    • Generate: 5 requests/minute per IP                  ║
║    • Contact: 3 messages/hour per IP                     ║
╚══════════════════════════════════════════════════════════╝
  `);
});
