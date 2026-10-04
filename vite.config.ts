import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Development CSP - more permissive for local development
const DEV_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://studioeighty7.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com",
  "img-src 'self' https: data: http://localhost:*",
  "connect-src 'self' https: http: ws: wss:",
  "media-src 'self' https://studioeighty7.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join('; ');

// Production CSP - strict with necessary CDNs and APIs
const PROD_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com",
  "img-src 'self' https: data:",
  "connect-src 'self' https://studioeighty7.com https://generativelanguage.googleapis.com",
  "media-src 'self' https://studioeighty7.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ');

// Production security headers
const PROD_SECURITY_HEADERS = {
  'Content-Security-Policy': PROD_CSP,
  'Strict-Transport-Security': 'max-age=15768000; includeSubDomains; preload',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': [
    'geolocation=()',
    'microphone=()',
    'camera=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()',
  ].join(', '),
  'Cross-Origin-Opener-Policy': 'same-origin',
};

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
    headers: {
      'Content-Security-Policy': DEV_CSP,
    },
    // Proxy API calls to backend during development (if backend is running)
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log(
              'Backend proxy error (this is OK if backend is not running):',
              err.message
            );
          });
        },
      },
      // Proxy WordPress API calls using the compatible rest_route format
      '/wp-api': {
        target: 'https://studioeighty7.com/index.php',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/wp-api/, ''),
        configure: (proxy, _options) => {
          // localhost cookies from every other dev app ride along; the host's
          // nginx rejects the oversized header with a 400
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.removeHeader('cookie');
          });
          proxy.on('error', (err) => {
            console.warn('WordPress proxy error:', err.message);
          });
        },
      },
    },
  },
  preview: {
    port: 4173,
    headers: PROD_SECURITY_HEADERS,
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  // Production build configuration
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
});
