# Deployment Guide

## Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

## Setup

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

3. **Configure Supabase:**
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to Settings > API
   - Copy the `Project URL` and `anon public` key
   - Update `.env` with your values:
     ```
     VITE_SUPABASE_URL=https://your-project.supabase.co
     VITE_SUPABASE_ANON_KEY=your-anon-key-here
     ```

4. **Set up Supabase Database:**
   Run the migrations in `supabase/migrations/` on your Supabase project.
   You can do this via Supabase Dashboard > SQL Editor or using the Supabase CLI.

5. **Build for production:**
   ```bash
   npm run build
   ```

6. **Preview production build:**
   ```bash
   npm run preview
   ```

## Deployment Options

### Vercel (Recommended)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Set environment variables in Vercel dashboard or CLI:
   ```bash
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_ANON_KEY
   ```

### Netlify

1. Install Netlify CLI:
   ```bash
   npm i -g netlify-cli
   ```

2. Deploy:
   ```bash
   netlify deploy --prod
   ```

3. Set environment variables in Netlify dashboard.

### Docker

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Static Hosting (AWS S3, Cloudflare Pages, etc.)

1. Build the project:
   ```bash
   npm run build
   ```

2. Upload the `dist/` folder contents to your hosting provider.

3. Configure SPA routing (redirect all routes to `index.html`).

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Your Supabase anonymous key |
| `VITE_APP_NAME` | No | Application name (default: KDP Publishing Studio) |

## Performance Optimizations

The production build includes:
- Code splitting for vendor libraries
- Minification with Terser
- Gzip compression
- CSS extraction and minification

## Monitoring (Optional)

### Sentry Error Tracking

1. Create a Sentry project
2. Install Sentry SDK:
   ```bash
   npm install @sentry/react
   ```

3. Add to your app initialization

### Google Analytics

1. Create a GA4 property
2. Add tracking ID to environment:
   ```
   VITE_GA_TRACKING_ID=G-XXXXXXXXXX
   ```

## Troubleshooting

### Build fails with TypeScript errors
```bash
npm run build  # Shows TypeScript errors
npx tsc --noEmit  # Check types
```

### Supabase connection issues
- Verify environment variables are set correctly
- Check Supabase project status
- Verify RLS policies allow anonymous access

### Production build warnings
Large bundle warnings can be addressed by:
- Adding more vendor chunks
- Implementing lazy loading for routes
- Using dynamic imports for heavy components
