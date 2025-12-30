<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Studio Eighty7

> **Audio Tek-Domain** - Premium Music Production & Audio Engineering

A modern, high-performance website for Studio Eighty7, featuring a sleek dark-mode design with dynamic animations, AI-powered features, and seamless WordPress CMS integration.

## ✨ Features

- 🎨 **Premium Neo-Editorial Design** - Stunning dark-mode interface with glassmorphism effects
- 🎵 **Interactive Audio Player** - Custom-built track player with waveform visualization
- 🤖 **AI Oracle** - Gemini-powered creative assistant for lyric generation and music ideas
- 📱 **Fully Responsive** - Optimized for all devices and screen sizes
- ⚡ **Lightning Fast** - Built with Vite for optimal performance
- 🔒 **Production-Ready Security** - CSP headers, input validation, and secure API handling

## 🚀 Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 6
- **Runtime**: Bun (fast JavaScript runtime)
- **Styling**: Tailwind CSS (via CDN)
- **Icons**: Lucide React
- **AI Integration**: Google Gemini API
- **Fonts**: Rajdhani, Teko (Google Fonts)

## 📋 Prerequisites

- [Bun](https://bun.sh) v1.0 or higher
- Google Gemini API key (optional, for AI features)

## 🛠️ Quick Start

### 1. Install Dependencies

```bash
bun install
```

### 2. Configure Environment (Optional)

If you want to use the AI Oracle feature, create a `.env.local` file:

```bash
cp .env.example .env.local
```

Add your Google Gemini API key:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

> **Note**: The site works perfectly without the API key - the AI Oracle feature will simply be disabled.

### 3. Run Development Server

```bash
bun run dev
```

The application will be available at **http://localhost:3000**

## 📜 Available Scripts

- `bun run dev` - Start development server with hot reload
- `bun run build` - Build optimized production bundle
- `bun run preview` - Preview production build locally
- `bun run sri:generate` - Generate SRI hash for Tailwind CSS CDN

## 🏗️ Project Structure

```
studio-eighty7/
├── components/              # React components
│   ├── Navbar.tsx          # Navigation header
│   ├── Hero.tsx            # Hero section with full-width background
│   ├── TrackPlayer.tsx     # Audio player component
│   ├── Services.tsx        # Services showcase
│   ├── Albums.tsx          # Album gallery
│   ├── About.tsx           # About section
│   ├── AiOracle.tsx        # AI-powered creative assistant
│   ├── Contact.tsx         # Contact form
│   └── Footer.tsx          # Site footer
├── services/               # API integration services
│   ├── gemini.ts          # Google Gemini AI service
│   └── wordpress.ts       # WordPress CMS integration
├── App.tsx                 # Main application component
├── index.tsx               # React entry point
├── index.html              # HTML template
├── constants.ts            # Static data (stats, genres, etc.)
├── types.ts                # TypeScript type definitions
├── vite.config.ts          # Vite configuration
└── tsconfig.json           # TypeScript configuration
```

## 🎨 Design System

### Color Palette

- **Samurai Black**: `#050505` - Primary background
- **Samurai Red**: `#DC2626` - Accent color
- **Samurai Gray**: `#1F1F22` - Secondary background

### Typography

- **Display Font**: Teko (300, 400, 500, 600, 700)
- **Body Font**: Rajdhani (500, 600, 700)

### Key Design Features

- Full-width hero background with gradient masks
- Clipped polygon shapes for modern aesthetic
- Text stroke effects for visual depth
- Smooth hover transitions and micro-animations
- Glassmorphism cards and overlays

## 🔐 Security Features

- **Content Security Policy (CSP)** - Strict headers configured in `vite.config.ts`
- **Subresource Integrity (SRI)** - CDN resources verified with cryptographic hashes
- **Input Validation** - Zod schema validation for all user inputs
- **XSS Protection** - React's built-in escaping + CSP
- **Secure Headers** - X-Frame-Options, X-Content-Type-Options, HSTS

## 📦 Build for Production

```bash
# Create optimized production build
bun run build

# Preview the production build
bun run preview
```

The production build will be in the `dist/` directory, ready for deployment.

### Deployment Options

- **Static Hosting**: Vercel, Netlify, Cloudflare Pages
- **Traditional Hosting**: Nginx, Apache
- **CDN**: Any CDN that supports SPA routing

### Nginx Configuration Example

```nginx
server {
    listen 80;
    server_name studioeighty7.com;
    root /var/www/studio-eighty7/dist;
    index index.html;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 🔧 Configuration

### Vite Configuration

The `vite.config.ts` includes:

- React plugin with Fast Refresh
- Security headers (CSP, HSTS, etc.)
- Build optimizations (minification, code splitting)
- Development server configuration

### TypeScript Configuration

Strict mode enabled with:

- ES2020 target
- Module resolution for React 19
- Path aliases support
- Type checking for all files

## 📚 Additional Documentation

- **[AGENTS.md](AGENTS.md)** - AI agent coding guidelines and patterns
- **[DEV_GUIDE.md](DEV_GUIDE.md)** - Development workflow and best practices
- **[QUICK_START.md](QUICK_START.md)** - Condensed setup instructions
- **[WORDPRESS_SETUP_GUIDE.md](WORDPRESS_SETUP_GUIDE.md)** - CMS integration guide
- **[SECURITY_HEADERS.md](SECURITY_HEADERS.md)** - Detailed security documentation

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
bun run dev --port 3001
```

### Build Errors

```bash
# Clear cache and reinstall
rm -rf node_modules bun.lock dist
bun install
bun run build
```

### AI Oracle Not Working

- Verify `VITE_GEMINI_API_KEY` is set in `.env.local`
- Check API key is valid at [Google AI Studio](https://makersuite.google.com/app/apikey)
- Ensure you haven't exceeded API quotas

## 🤝 Contributing

This is a private project for Studio Eighty7. For questions or support, please contact the development team.

## 📄 License

ISC © Studio Eighty7

---

<div align="center">
Built with ❤️ using React, TypeScript, and Bun
</div>
