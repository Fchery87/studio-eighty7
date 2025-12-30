import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate required environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

if (!GEMINI_API_KEY) {
  console.error('FATAL: GEMINI_API_KEY environment variable is not set');
  process.exit(1);
}

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
    .refine((val) => /^[a-zA-Z0-9\s\-\.'’]+$/.test(val), {
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
});

// Initialize Google Gemini AI
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// Health check endpoint (no rate limiting)
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'studio-eighty7-backend',
  });
});

// Generate endpoint with rate limiting and validation
app.post('/api/generate', generateRateLimiter, async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = GenerateRequestSchema.parse(req.body);

    const { topic } = validatedData;

    console.log(`Generating creative idea for topic: "${topic}"`);

    // Call Google Gemini API
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a legendary music producer and lyricist for Studio Eighty7. 
      The user needs a song concept, title, or a one-line lyric hook for: "${topic}".
      Provide a punchy, moody, or hard-hitting creative text snippet.
      Keep it under 20 words. Focus on rhythm, emotion, and grit.`,
    });

    const generatedText = response.text || "Listen to the silence. The beat will drop.";

    console.log(`Generated idea: "${generatedText}"`);

    // Return successful response
    res.status(200).json({
      success: true,
      data: generatedText,
    });

  } catch (error) {
    console.error('Error generating creative idea:', error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation error',
        message: error.issues[0]?.message || 'Invalid request body',
      });
      return;
    }

    // Handle Gemini API errors
    if (error && typeof error === 'object' && 'status' in error) {
      const status = (error as any).status;
      if (status === 401 || status === 403) {
        res.status(500).json({
          error: 'Service unavailable',
          message: 'The signal is lost. Check your frequency.',
        });
        return;
      }
      if (status === 429) {
        res.status(429).json({
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
        });
        return;
      }
    }

    // Generic error response
    res.status(500).json({
      error: 'Internal server error',
      message: 'The signal is lost. Check your frequency.',
    });
  }
});

// Contact form endpoint with rate limiting and validation
app.post('/api/contact', contactRateLimiter, async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = ContactRequestSchema.parse(req.body);

    const { name, email, message } = validatedData;

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
