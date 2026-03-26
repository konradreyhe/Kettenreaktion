# Deployment Plan

## Infrastructure

| Service | Tier | Purpose | Cost |
|---------|------|---------|------|
| **Vercel** | Free | Hosting, auto-deploy, HTTPS, global CDN | $0/mo |
| **Cloudflare** | Free | Asset CDN, rate limiting, DNS | $0/mo |
| **Supabase** | Free | Leaderboard DB (Phase 2) | $0/mo (500MB, 50k MAU) |
| **Namecheap** | Domain | kettenpuzzle.com or chainpuzzle.io | ~$12/yr |
| **GitHub** | Free | Source code, CI, issues | $0/mo |

**Total cost at launch: ~$1/month** (domain only)

## Deployment Pipeline

```
Developer pushes to main
        │
        ▼
GitHub receives push
        │
        ▼
Vercel auto-builds (Vite production build)
        │
        ▼
Vercel deploys to global CDN
        │
        ▼
Cloudflare caches static assets
        │
        ▼
Live at https://kettenpuzzle.com
```

**Deploy time:** < 60 seconds from push to live.

## Vercel Configuration

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": null,
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

## Vite Build Configuration

```typescript
// vite.config.ts
export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser']  // ~1MB separate chunk, cached independently
        }
      }
    }
  }
});
```

## Environment Variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `VITE_SUPABASE_URL` | Vercel env settings | Supabase project URL (Phase 2) |
| `VITE_SUPABASE_ANON_KEY` | Vercel env settings | Supabase public anon key (Phase 2) |

- `.env` for local development (in `.gitignore`)
- `.env.example` committed with placeholders
- Vercel dashboard for production values

## Domain Setup

1. Purchase domain on Namecheap (~$12/yr)
2. Point nameservers to Cloudflare
3. Add domain in Vercel project settings
4. Vercel auto-provisions SSL certificate
5. Cloudflare handles DNS + CDN

## CDN Strategy

| Asset Type | Cache Duration | CDN |
|-----------|---------------|-----|
| HTML (index.html) | No cache (always fresh) | Vercel |
| JS/CSS (hashed) | 1 year (immutable) | Vercel + Cloudflare |
| Kenney sprites | 1 year (immutable) | Cloudflare |
| Audio files | 1 year (immutable) | Cloudflare |
| Level JSON | 1 hour | Vercel |

## PWA Configuration (Phase 2)

```json
// public/manifest.json
{
  "name": "Kettenreaktion",
  "short_name": "Kette",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1a1a2e",
  "theme_color": "#1a1a2e",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

Service worker: cache-first for assets, network-first for level data.

## SEO Setup

```html
<!-- index.html -->
<title>Kettenreaktion - Taegliches Physik-Puzzle</title>
<meta name="description" content="Ein neues Physik-Puzzle taeglich. Platziere ein Objekt, loese die Kettenreaktion. Kostenlos im Browser.">
<meta property="og:title" content="Kettenreaktion">
<meta property="og:description" content="Taegliches Physik-Puzzle im Browser">
<meta property="og:image" content="https://kettenpuzzle.com/og-preview.png">
<meta property="og:url" content="https://kettenpuzzle.com">
<meta name="twitter:card" content="summary_large_image">
```

Plus: `robots.txt`, `sitemap.xml` (generated at build time).

## Monitoring

| What | Tool | Phase |
|------|------|-------|
| Uptime | Vercel dashboard | Launch |
| Performance | Lighthouse CI | Launch |
| Errors | Browser console + Sentry Free (if needed) | Launch |
| Analytics | Vercel Analytics Free or Plausible | Launch |
| Supabase metrics | Supabase dashboard | Phase 2 |

## Pre-Launch Checklist

- [ ] Domain purchased and DNS configured
- [ ] Vercel project connected to GitHub repo
- [ ] Production build succeeds (`npm run build`)
- [ ] Lighthouse score > 90 (all categories)
- [ ] Load time < 3s on 4G (WebPageTest)
- [ ] HTTPS working (auto via Vercel)
- [ ] CSP header configured
- [ ] og:image and meta tags verified (Facebook Debugger, Twitter Card Validator)
- [ ] robots.txt and sitemap.xml present
- [ ] 404 page configured
- [ ] `.env` not in repo, `.env.example` present
- [ ] Asset cache headers configured
- [ ] Mobile responsive (375px - 1440px)

## Scaling Considerations (future)

| DAU | Action Needed |
|-----|--------------|
| < 1k | No changes, free tier handles it |
| 1k-10k | Monitor Supabase usage, may need Pro tier ($25/mo) |
| 10k-50k | Vercel Pro ($20/mo) for analytics + more bandwidth |
| 50k+ | Evaluate Poki/CrazyGames hosting (they host, you get revenue share) |

---
**Last Updated:** 2026-03-26
