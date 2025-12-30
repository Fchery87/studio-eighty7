# Studio Eighty7 Backend Server

A secure Node.js/Express backend server that proxies requests to Google Gemini API, keeping the API key secure on the server side.

## Security Features

- **API Key Protection**: Gemini API key is stored in server environment variables, never exposed to the client
- **Input Validation**: All requests are validated using Zod schema
- **Rate Limiting**: 5 requests per minute per IP to prevent abuse
- **CORS Protection**: Configured to only accept requests from frontend origin
- **Security Headers**: Helmet.js provides security best practices
- **Request Size Limits**: Body parser limited to 10kb to prevent large payload attacks

## Setup Instructions

### 1. Install Dependencies

Navigate to the server directory and install dependencies:

```bash
cd server
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` and add your Google Gemini API key:

```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
PORT=3001
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

**Get your Gemini API key**: https://makersuite.google.com/app/apikey

### 3. Start the Server

For development (with auto-reload on file changes):

```bash
npm run dev
```

For production:

```bash
npm start
```

The server will start on port 3001 (default) and log its status.

## API Endpoint

### POST /api/generate

Generates creative ideas using Google Gemini AI.

**Request Body:**
```json
{
  "topic": "string (1-200 characters)"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": "Generated creative idea string"
}
```

**Response (Error):**
```json
{
  "error": "Error type",
  "message": "Human-readable error message"
}
```

**Rate Limit:** 5 requests per minute per IP address

### GET /health

Health check endpoint (not rate-limited).

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-29T00:00:00.000Z",
  "service": "studio-eighty7-backend"
}
```

## Running the Full Stack

### Development Mode

1. Start the backend server:
   ```bash
   cd server
   npm run dev
   ```

2. In a new terminal, start the frontend development server:
   ```bash
   cd ..
   npm run dev
   ```

The Vite dev server will proxy `/api` requests to `http://localhost:3001`.

### Production Mode

For production deployment:
1. Build the frontend: `npm run build`
2. Configure your production web server (e.g., Nginx, Apache) to:
   - Serve the frontend static files from `/dist`
   - Proxy `/api` requests to the backend server on port 3001

Or use a process manager like PM2 to run both services:

```bash
# Start backend
pm2 start server/index.js --name studio-backend

# Build and serve frontend
npm run build
pm2 serve dist 3000 --name studio-frontend
```

## Project Structure

```
server/
├── index.ts          # Main Express server file
├── package.json      # Backend dependencies and scripts
├── tsconfig.json     # TypeScript configuration
├── .env.example      # Environment variable template
└── README.md         # This file
```

## Dependencies

- **express**: Web framework
- **@google/genai**: Google Gemini AI SDK
- **express-rate-limit**: Rate limiting middleware
- **helmet**: Security headers middleware
- **cors**: CORS configuration
- **dotenv**: Environment variable loading
- **zod**: Runtime type validation

## Error Handling

The backend handles errors gracefully:

- **400**: Invalid request body (validation failed)
- **404**: Endpoint not found
- **429**: Rate limit exceeded
- **500**: Internal server error (Gemini API error or other issues)

All errors return JSON with `error` and `message` fields for consistent client-side handling.

## Security Best Practices

1. **Never commit `.env` files** - The `.env` file is in `.gitignore`
2. **Use strong API keys** - Generate unique API keys for different environments
3. **Monitor rate limits** - Adjust `max` in rate limiting config based on your needs
4. **Keep dependencies updated** - Run `npm audit` regularly
5. **Use HTTPS in production** - Configure SSL/TLS on your production server
6. **Set appropriate CORS origins** - Update `FRONTEND_URL` for your production domain

## Troubleshooting

### Server won't start
- Ensure Node.js (v18+) is installed: `node --version`
- Check that dependencies are installed: `npm install`
- Verify `.env` file exists with `GEMINI_API_KEY` set

### API returns errors
- Verify your Gemini API key is valid and active
- Check that you haven't exceeded Google's API quotas
- Review server logs for detailed error messages

### CORS errors
- Ensure `FRONTEND_URL` in `.env` matches your frontend's origin
- Check that the frontend is running on the expected port (default: 3000)

## License

ISC
