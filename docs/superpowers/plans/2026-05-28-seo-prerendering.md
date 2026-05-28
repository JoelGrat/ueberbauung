# SEO Prerendering + Meta Tags Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Widematte site fully indexable by Google and shareable on social platforms by adding meta/OG tags and prerendering the React app to static HTML at build time.

**Architecture:** Vite's `build()` API compiles `src/entry-server.tsx` in SSR mode at deploy time; the output is imported and executed to produce an HTML string; `scripts/prerender.mjs` then patches `dist/index.html` with that string before Vercel serves it. The client bundle hydrates the pre-rendered HTML using `hydrateRoot`.

**Tech Stack:** Vite 5, React 18 `renderToString` / `hydrateRoot`, Node.js ESM, Vercel

---

## File Map

| Action | Path | What it does |
|---|---|---|
| Modify | `src/App.tsx:332` | Fix `loading` init so SSR renders cards, not spinner |
| Modify | `index.html` | Add title, meta description, OG, Twitter, canonical |
| Create | `public/og.jpg` | OG preview image (user copies file) |
| Create | `src/entry-server.tsx` | SSR entry; exports `render()` → `renderToString(<App />)` |
| Create | `scripts/prerender.mjs` | Post-build: SSR build → render → patch dist/index.html |
| Modify | `package.json` | Append `&& node scripts/prerender.mjs` to build script |
| Modify | `src/main.tsx` | Switch `createRoot` → `hydrateRoot` (with dev fallback) |
| Create | `vercel.json` | 301 redirect www.widematte.ch → widematte.ch |

---

## Task 1: Fix loading state so SSR renders building cards

**Files:**
- Modify: `src/App.tsx:332`

**Context:** `useState(true)` means the buildings grid is hidden during `renderToString` (useEffect never runs in SSR). Changing the initializer to `!!supabase` skips the loading state when Supabase is unavailable (which includes all SSR build environments where env vars are absent).

- [ ] **Step 1: Edit App.tsx**

In `src/App.tsx`, find line 332:

```tsx
  const [loading, setLoading] = useState(true);
```

Replace with:

```tsx
  const [loading, setLoading] = useState(!!supabase);
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "fix: skip loading state when supabase is unavailable (enables SSR content render)"
```

---

## Task 2: Add meta / OG / canonical tags to index.html

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Replace the `<head>` block**

Open `index.html`. Replace the entire `<head>` content with:

```html
<!doctype html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <title>Widematte – Eigentumswohnungen &amp; Mietwohnungen in Nesselnbach</title>
    <meta name="description" content="Neubauwohnungen an ruhiger Lage in Nesselnbach – 4.5- und 5.5-Zimmer-Eigentumswohnungen sowie Mietwohnungen. Direkt beim Landwirtschaftsgebiet." />

    <meta property="og:type"        content="website" />
    <meta property="og:url"         content="https://widematte.ch/" />
    <meta property="og:title"       content="Widematte – Eigentumswohnungen &amp; Mietwohnungen in Nesselnbach" />
    <meta property="og:description" content="Neubauwohnungen an ruhiger Lage – 4.5- und 5.5-Zimmer-Wohnungen in Nesselnbach." />
    <meta property="og:image"       content="https://widematte.ch/og.jpg" />

    <meta name="twitter:card"  content="summary_large_image" />
    <meta name="twitter:image" content="https://widematte.ch/og.jpg" />

    <link rel="canonical" href="https://widematte.ch/" />
  </head>
  <body class="antialiased">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "feat: add title, meta description, Open Graph, and canonical tags"
```

---

## Task 3: Add OG image to public/

**Files:**
- Create: `public/og.jpg`

- [ ] **Step 1: Create public/ directory and copy image**

In your file explorer or terminal, copy your exterior render to `public/og.jpg`:

```bash
# Adjust the source path to wherever your file is
mkdir -p public
cp "Images/Aussenansicht/Aussenansicht_0.jpg" public/og.jpg
```

If the source file has a different extension (`.png`, `.webp`), copy it as `public/og.jpg` regardless — JPEG is the most compatible format for OG images. If the original is `.png`, convert it or rename and update `index.html` accordingly.

Ideal dimensions: **1200 × 630 px**. If the source is larger, that is fine — social platforms will scale it down.

- [ ] **Step 2: Verify Vite picks it up**

```bash
npm run dev
```

Open `http://localhost:5173/og.jpg` in a browser. You should see the exterior render image.

- [ ] **Step 3: Commit**

```bash
git add public/og.jpg
git commit -m "feat: add OG preview image to public/"
```

---

## Task 4: Create SSR entry point

**Files:**
- Create: `src/entry-server.tsx`

- [ ] **Step 1: Create the file**

```tsx
import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';

export function render(): string {
  return renderToString(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors. (`react-dom/server` ships types with `react-dom`, already installed.)

- [ ] **Step 3: Commit**

```bash
git add src/entry-server.tsx
git commit -m "feat: add SSR entry point for prerendering"
```

---

## Task 5: Create prerender script

**Files:**
- Create: `scripts/prerender.mjs`

- [ ] **Step 1: Create the scripts/ directory and file**

```bash
mkdir -p scripts
```

Create `scripts/prerender.mjs` with the following content:

```js
import { build } from 'vite';
import { readFileSync, writeFileSync, rmSync } from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

// 1. Build the SSR bundle (inherits vite.config.ts plugins automatically)
await build({
  root,
  logLevel: 'warn',
  build: {
    ssr: 'src/entry-server.tsx',
    outDir: 'dist-server',
  },
});

// 2. Import and execute the SSR bundle
const entryPath = pathToFileURL(path.resolve(root, 'dist-server/entry-server.js')).href;
const { render } = await import(entryPath);
const appHtml = render();

// 3. Read the client-built index.html
const templatePath = path.resolve(root, 'dist/index.html');
const template = readFileSync(templatePath, 'utf-8');

// 4. Inject pre-rendered HTML into the root div
const html = template.replace(
  '<div id="root"></div>',
  `<div id="root">${appHtml}</div>`,
);

// 5. Write the patched file
writeFileSync(templatePath, html, 'utf-8');

// 6. Remove the temporary SSR build artefacts
rmSync(path.resolve(root, 'dist-server'), { recursive: true, force: true });

console.log('✓ Prerender complete — dist/index.html patched');
```

- [ ] **Step 2: Commit**

```bash
git add scripts/prerender.mjs
git commit -m "feat: add prerender script (Vite SSR → patch dist/index.html)"
```

---

## Task 6: Update build script in package.json

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Edit the build script**

In `package.json`, change:

```json
"build": "vite build",
```

to:

```json
"build": "vite build && node scripts/prerender.mjs",
```

- [ ] **Step 2: Commit**

```bash
git add package.json
git commit -m "build: run prerender script after vite build"
```

---

## Task 7: Switch main.tsx to hydrateRoot

**Files:**
- Modify: `src/main.tsx`

**Context:** `hydrateRoot` attaches React to the pre-rendered HTML instead of discarding it. The `hasChildNodes()` check keeps `npm run dev` warning-free (the dev server serves an empty root with no prerender).

- [ ] **Step 1: Replace main.tsx**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const rootEl = document.getElementById('root') as HTMLElement;

if (rootEl.hasChildNodes()) {
  ReactDOM.hydrateRoot(rootEl, <React.StrictMode><App /></React.StrictMode>);
} else {
  ReactDOM.createRoot(rootEl).render(<React.StrictMode><App /></React.StrictMode>);
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/main.tsx
git commit -m "feat: switch to hydrateRoot to hydrate pre-rendered HTML"
```

---

## Task 8: Create vercel.json with www redirect

**Files:**
- Create: `vercel.json`

- [ ] **Step 1: Create the file**

```json
{
  "redirects": [
    {
      "source": "/(.*)",
      "has": [{ "type": "host", "value": "www.widematte.ch" }],
      "destination": "https://widematte.ch/$1",
      "permanent": true
    }
  ]
}
```

The `has` condition matches only when the `Host` header is `www.widematte.ch`, so this redirect never fires for the primary domain.

- [ ] **Step 2: Commit**

```bash
git add vercel.json
git commit -m "feat: add Vercel redirect www.widematte.ch → widematte.ch"
```

---

## Task 9: Verify the full build

**Files:** none (verification only)

- [ ] **Step 1: Run the full build**

```bash
npm run build
```

Expected output ends with:
```
✓ Prerender complete — dist/index.html patched
```

- [ ] **Step 2: Inspect pre-rendered HTML**

```bash
grep -o 'Gebäude [123]' dist/index.html | head -5
```

Expected: matches like `Gebäude 1`, `Gebäude 2`, `Gebäude 3` — confirms apartment content is in the HTML, not behind JS.

- [ ] **Step 3: Check meta tags are present**

```bash
grep -o 'og:title.*content="[^"]*"' dist/index.html
```

Expected:
```
og:title" content="Widematte – Eigentumswohnungen & Mietwohnungen in Nesselnbach"
```

- [ ] **Step 4: Preview the production build**

```bash
npm run preview
```

Open `http://localhost:4173` in a browser. The page should load and function identically to today, with no visible regressions. Open DevTools → Network → disable JS → reload: section headings, building descriptions, and the availability table should all still be readable.

- [ ] **Step 5: Commit (if any tweaks were made during verification)**

```bash
git add -A
git commit -m "chore: verify prerender build"
```

---

## After deployment

Once deployed to Vercel:

1. **Test OG tags** — paste `https://widematte.ch` into [opengraph.xyz](https://www.opengraph.xyz) or Facebook's Sharing Debugger to verify the image, title, and description appear correctly.
2. **Submit to Google Search Console** — request indexing for `https://widematte.ch/` to trigger an immediate crawl.
3. **Verify canonical** — in Search Console, confirm Google sees `widematte.ch` (not `www`) as the canonical.
