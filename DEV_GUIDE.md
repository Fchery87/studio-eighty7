# Development Guide - Studio Eighty7

## Starting the Frontend Development Server

1. Install dependencies (if not already done):
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Access the site at: http://localhost:3000

## Backend Server Setup

The backend proxy server is required for these features to work:
- Contact form submissions
- AI Oracle (Gemini API)

### Starting the Backend Server

1. Navigate to server directory:
   ```bash
   cd server
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   PORT=3001
   ```

5. Start the backend server:
   ```bash
   npm start
   ```

The backend will run on http://localhost:3001

### Backend Features

- `/api/generate` - Proxy to Gemini API for AI Oracle
- `/api/contact` - Contact form endpoint (logs to console, ready for email service)

## Common Issues

### Site Looks Broken / Styles Not Loading

**Cause**: CSP (Content Security Policy) blocking resources
**Solution**: 
- Restart dev server after config changes: `npm run dev`
- Check browser console (F12) for CSP violations

### Contact Form Not Submitting

**Cause**: Backend server not running
**Solution**: Start backend server in separate terminal:
```bash
cd server
npm start
```

### AI Oracle Returns Errors

**Cause**: Backend server not running or missing API key
**Solution**:
- Ensure backend is running on port 3001
- Check `.env` file has valid GEMINI_API_KEY
- Check backend console for errors

### Backend Proxy Error Messages

These are **normal** if backend is not running:
```
Backend proxy error (this is OK if backend is not running): connect ECONNREFUSED
```

## Development Workflow

1. Terminal 1 - Backend Server:
   ```bash
   cd server
   npm start
   ```

2. Terminal 2 - Frontend Dev Server:
   ```bash
   npm run dev
   ```

3. Browser - Access site: http://localhost:3000

## Production Deployment

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Preview production build:
   ```bash
   npm run preview
   ```

3. Deploy `dist/` folder to your hosting provider

## Security Features Implemented

- ✅ API Key Protection (backend proxy)
- ✅ Content Security Policy (CSP)
- ✅ Rate Limiting (client + server)
- ✅ Input Validation & Sanitization
- ✅ XSS Prevention
- ✅ Security Headers (HSTS, X-Frame-Options, etc.)
- ✅ Subresource Integrity (SRI)
