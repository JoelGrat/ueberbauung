# SEO: Prerendering + Meta Tags

**Date:** 2026-05-28  
**Status:** Approved

## Goal

Make the Widematte site indexable by Google and shareable on social platforms (WhatsApp, iMessage, etc.) with correct title, description, and preview image.

## Approach

Vite SSR prerender at build time — React's `renderToString` bakes all text content into the static `dist/index.html`. Vercel serves the pre-baked HTML. No framework migration, no new runtime dependencies.

## Meta Tags (`index.html`)

```html
<title>Widematte – Eigentumswohnungen & Mietwohnungen in Nesselnbach</title>
<meta name="description" content="Neubauwohnungen an ruhiger Lage in Nesselnbach – 4.5- und 5.5-Zimmer-Eigentumswohnungen sowie Mietwohnungen. Direkt beim Landwirtschaftsgebiet." />

<meta property="og:type"        content="website" />
<meta property="og:url"         content="https://widematte.ch/" />
<meta property="og:title"       content="Widematte – Eigentumswohnungen & Mietwohnungen in Nesselnbach" />
<meta property="og:description" content="Neubauwohnungen an ruhiger Lage – 4.5- und 5.5-Zimmer-Wohnungen in Nesselnbach." />
<meta property="og:image"       content="https://widematte.ch/og.jpg" />

<meta name="twitter:card"  content="summary_large_image" />
<meta name="twitter:image" content="https://widematte.ch/og.jpg" />

<link rel="canonical" href="https://widematte.ch/" />
```

## OG Image

- Source: exterior render supplied by user (`Images/Aussenansicht/Aussenansicht_0.*`)
- Destination: `public/og.jpg` (Vite copies to `dist/og.jpg` automatically)
- Served at: `https://widematte.ch/og.jpg`

## New Files

| File | Purpose |
|---|---|
| `src/entry-server.tsx` | SSR entry; exports `render()` → `renderToString(<App />)` |
| `scripts/prerender.mjs` | Post-build script; builds SSR bundle, calls `render()`, patches `dist/index.html` |
| `public/og.jpg` | OG preview image |
| `vercel.json` | Redirect `www.widematte.ch` → `widematte.ch` (301) |

## Modified Files

| File | Change |
|---|---|
| `index.html` | Add all meta/OG/canonical tags |
| `src/main.tsx` | Switch `createRoot` → `hydrateRoot` |
| `package.json` | `"build": "vite build && node scripts/prerender.mjs"` |

## What Gets Pre-rendered

| Content | Pre-rendered |
|---|---|
| Nav, hero text, section headings | Yes |
| Building descriptions, room counts, prices | Yes |
| Apartment availability table | Yes |
| Carousel images (Supabase, loaded in useEffect) | No — loads client-side after hydration |

## Vercel Redirect (`vercel.json`)

```json
{
  "redirects": [
    {
      "source": "https://www.widematte.ch/:path*",
      "destination": "https://widematte.ch/:path*",
      "permanent": true
    }
  ]
}
```

## Build Flow

```
npm run build
  └─ vite build              → dist/ (client bundle + index.html)
  └─ node scripts/prerender.mjs
       ├─ vite build --ssr   → dist-server/entry-server.js
       ├─ render()           → HTML string
       ├─ patch dist/index.html (<div id="root"> → <div id="root">{html}</div>)
       └─ rm -rf dist-server (cleanup)
```

## No New Runtime Dependencies

`react-dom/server` (provides `renderToString`) ships with the existing `react-dom` install.
