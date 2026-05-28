# Page Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement 9 code changes to the Widematte real estate site: interior images in building cards, hero availability count, outdoor space column, Warteliste CTA, Grundrisse PDF downloads, Google Maps embed, phone number in contact, footer redesign with stub pages, and house SVG favicon.

**Architecture:** All UI changes are in `src/App.tsx` (608 lines, single-file app). New files: `public/favicon.svg`, `public/impressum.html`, `public/datenschutz.html`. One `index.html` change for the favicon link. No test runner configured — verify visually with `npm run dev`.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, lucide-react

---

## File Map

| Action | Path | What it does |
|---|---|---|
| Modify | `src/App.tsx:53-57` | Update `buildingImagePaths` with interior renders |
| Modify | `src/App.tsx:1` | Add `Phone` to lucide-react imports |
| Modify | `src/App.tsx:417-425` | Hero: add availability count line |
| Modify | `src/App.tsx:472-490` | Mobile cards: add outdoor row |
| Modify | `src/App.tsx:514` | Desktop table: add Aussenbereich column header |
| Modify | `src/App.tsx:527` | Desktop table: add outdoor data cell |
| Modify | `src/App.tsx:499-501` | Mobile cards: Warteliste → clickable button |
| Modify | `src/App.tsx:541-544` | Desktop table: Warteliste → clickable button |
| Modify | `src/App.tsx:333` | Add `requestWaitlist` handler |
| Modify | `src/App.tsx:560-568` | Grundrisse: replace empty body with PDF download cards |
| Modify | `src/App.tsx:577-587` | Lage: add Google Maps iframe |
| Modify | `src/App.tsx:589-598` | Kontakt: add email + phone before form |
| Modify | `src/App.tsx:600-602` | Footer: full redesign |
| Create | `public/favicon.svg` | House SVG icon |
| Create | `public/impressum.html` | Stub page |
| Create | `public/datenschutz.html` | Stub page |
| Modify | `index.html` | Add favicon `<link>` |

---

## Task 1: Interior renders in buildingImagePaths

**Files:**
- Modify: `src/App.tsx:53-57`

**Context:** `buildingImagePaths` maps building IDs to ordered image paths. Local paths starting with `/` are served from `public/`. Interior renders exist at `public/Images/Innenansicht/`. Add them as the first images for buildings 1 and 3.

- [ ] **Step 1: Update buildingImagePaths**

In `src/App.tsx`, find lines 53–57:

```tsx
const buildingImagePaths: Record<string, string[]> = {
  '1': ['/Images/Aussenansicht/Aussenansicht_0.jpg', '/Images/Aussenansicht/Aussenansicht_1.jpg'],
  '2': ['/Images/Aussenansicht/Aussenansicht_2.jpg'],
  '3': ['/Images/Aussenansicht/Aussenansicht_BirdView.jpg', '/Images/Aussenansicht/Aussenansicht_0.jpg'],
};
```

Replace with:

```tsx
const buildingImagePaths: Record<string, string[]> = {
  '1': [
    '/Images/Innenansicht/Geb1_EG_Livingroom.jpg',
    '/Images/Aussenansicht/Aussenansicht_0.jpg',
    '/Images/Aussenansicht/Aussenansicht_1.jpg',
  ],
  '2': ['/Images/Aussenansicht/Aussenansicht_2.jpg'],
  '3': [
    '/Images/Innenansicht/Geb3_OG_Livingroom.jpg',
    '/Images/Innenansicht/Geb3_DG_Livingroom.jpg',
    '/Images/Innenansicht/Geb3_EG_Badezimmer.jpg',
    '/Images/Aussenansicht/Aussenansicht_BirdView.jpg',
    '/Images/Aussenansicht/Aussenansicht_0.jpg',
  ],
};
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: add interior renders to building card carousels"
```

---

## Task 2: Availability count in hero

**Files:**
- Modify: `src/App.tsx:326-428`

**Context:** The hero currently shows a static tagline. Add a computed count line below it: "5 von 9 Wohnungen verfügbar". `apartments` is a module-level constant (9 units); filter by `status === 'available'` to get the live count.

- [ ] **Step 1: Compute availableCount in App function body**

In `src/App.tsx`, inside the `App` function, after `const closeMenu = () => setMenuOpen(false);` (around line 331), add:

```tsx
const availableCount = apartments.filter(a => a.status === 'available').length;
```

- [ ] **Step 2: Update hero JSX**

Find lines 417–425:

```tsx
        <div className="relative text-center px-6 max-w-5xl">
          <h1 className="text-5xl sm:text-7xl md:text-9xl font-light mb-6 text-white drop-shadow-md">Ländlich wohnen</h1>
          <p className="text-lg md:text-2xl font-light text-gray-200 mb-10 md:mb-12">
            Drei Gebäude. Neun Wohnungen. Zeitlose Architektur im Aargau.
          </p>
          <a href="#apartments" className="inline-block px-8 py-4 bg-black/80 text-white text-xs tracking-widest uppercase">
            Wohnungen entdecken
          </a>
        </div>
```

Replace with:

```tsx
        <div className="relative text-center px-6 max-w-5xl">
          <h1 className="text-5xl sm:text-7xl md:text-9xl font-light mb-6 text-white drop-shadow-md">Ländlich wohnen</h1>
          <p className="text-lg md:text-2xl font-light text-gray-200 mb-0">
            Drei Gebäude. Neun Wohnungen. Zeitlose Architektur im Aargau.
          </p>
          <p className="text-sm text-gray-300 mt-4 tracking-wide mb-10 md:mb-12">
            {availableCount} von {apartments.length} Wohnungen verfügbar
          </p>
          <a href="#apartments" className="inline-block px-8 py-4 bg-black/80 text-white text-xs tracking-widest uppercase">
            Wohnungen entdecken
          </a>
        </div>
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: show live availability count in hero section"
```

---

## Task 3: Outdoor space in availability table

**Files:**
- Modify: `src/App.tsx:459-551`

**Context:** One apartment (id: 2, Gebäude 1 · 1. OG) has `outdoor: 23.74`. The `Apartment` interface already includes `outdoor?: number`. Add "Aussenbereich" between NWF and Preis in the desktop table, and an outdoor row in mobile cards (only when `apt.outdoor` is defined).

- [ ] **Step 1: Update desktop table headers**

Find line 514:

```tsx
                  {['Wohnung', 'Zimmer', 'NWF', 'Preis', 'Status', ''].map((h) => (
```

Replace with:

```tsx
                  {['Wohnung', 'Zimmer', 'NWF', 'Aussenbereich', 'Preis', 'Status', ''].map((h) => (
```

- [ ] **Step 2: Add outdoor data cell in desktop table rows**

Find line 527 (the NWF cell):

```tsx
                    <td className="py-7 text-sm text-gray-700">{apt.size} m²</td>
                    <td className="py-7 text-base font-light">
```

Replace with:

```tsx
                    <td className="py-7 text-sm text-gray-700">{apt.size} m²</td>
                    <td className="py-7 text-sm text-gray-700">{apt.outdoor !== undefined ? `${apt.outdoor} m²` : '—'}</td>
                    <td className="py-7 text-base font-light">
```

- [ ] **Step 3: Add outdoor row in mobile cards**

Find lines 472–490 (the `grid grid-cols-2` block in mobile cards):

```tsx
                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div>
                    {buildingShowPrice[apt.building] ? (
```

After the opening `<div className="grid grid-cols-2 gap-4 mb-5">`, there's the price div. Add an outdoor div inside the grid, after the existing price div and before `</div>` closing the grid. The full grid block becomes:

```tsx
                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div>
                    {buildingShowPrice[apt.building] ? (
                      buildingListingType[apt.building] === 'rent' ? (
                        <>
                          <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Mietpreis</p>
                          <p className="text-sm font-light">CHF {Math.round(apt.rent / 12).toLocaleString('de-CH')} / Monat</p>
                        </>
                      ) : (
                        <>
                          <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Verkaufspreis</p>
                          <p className="text-sm font-light">CHF {apt.price.toLocaleString('de-CH')}</p>
                        </>
                      )
                    ) : buildingListingType[apt.building] === 'rent' ? (
                      <p className="text-sm font-light text-gray-500">Mietobjekt</p>
                    ) : null}
                  </div>
                  {apt.outdoor !== undefined && (
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Aussenbereich</p>
                      <p className="text-sm font-light">{apt.outdoor} m²</p>
                    </div>
                  )}
                </div>
```

- [ ] **Step 4: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx
git commit -m "feat: add Aussenbereich column to availability table"
```

---

## Task 4: Warteliste CTA

**Files:**
- Modify: `src/App.tsx:333-343` (add handler)
- Modify: `src/App.tsx:499-501` (mobile reserved row)
- Modify: `src/App.tsx:541-545` (desktop reserved cell)

**Context:** The reserved apartment (Gebäude 3 · DG) shows an inert "Warteliste" label. Make it clickable — same behaviour as "Unterlagen anfordern" but with a pre-filled waitlist message.

- [ ] **Step 1: Add requestWaitlist handler**

In `src/App.tsx`, after the `requestBuildingInfo` function (around line 343), add:

```tsx
  const requestWaitlist = (apt: Apartment) => {
    setPrefill(`Ich interessiere mich für Gebäude ${apt.building} · ${floorLabel(apt.floor)} und möchte auf die Warteliste gesetzt werden.`);
    closeMenu();
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };
```

- [ ] **Step 2: Make mobile reserved row clickable**

Find lines 499–501:

```tsx
                {apt.status === 'reserved' && (
                  <p className="text-xs uppercase tracking-widest text-gray-400 text-center py-3 border border-gray-200">Reserviert</p>
                )}
```

Replace with:

```tsx
                {apt.status === 'reserved' && (
                  <button
                    onClick={() => requestWaitlist(apt)}
                    className="w-full py-3 border border-black text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
                  >
                    Warteliste
                  </button>
                )}
```

- [ ] **Step 3: Make desktop reserved cell clickable**

Find lines 541–545:

```tsx
                      {apt.status === 'available' ? (
                        <button onClick={() => requestInfo(apt)} className="text-xs border-b border-black pb-1 uppercase tracking-widest hover:opacity-50 transition-opacity">Unterlagen anfordern</button>
                      ) : apt.status === 'reserved' ? (
                        <span className="text-xs border-b border-gray-300 pb-1 uppercase tracking-widest text-gray-400 cursor-not-allowed">Warteliste</span>
                      ) : null}
```

Replace with:

```tsx
                      {apt.status === 'available' ? (
                        <button onClick={() => requestInfo(apt)} className="text-xs border-b border-black pb-1 uppercase tracking-widest hover:opacity-50 transition-opacity">Unterlagen anfordern</button>
                      ) : apt.status === 'reserved' ? (
                        <button onClick={() => requestWaitlist(apt)} className="text-xs border-b border-black pb-1 uppercase tracking-widest hover:opacity-50 transition-opacity">Warteliste</button>
                      ) : null}
```

- [ ] **Step 4: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx
git commit -m "feat: make Warteliste CTA clickable with pre-filled contact message"
```

---

## Task 5: Grundrisse PDF download cards

**Files:**
- Modify: `src/App.tsx:560-568`

**Context:** The Grundrisse section body is empty (just a heading and paragraph). Replace it with a 2-column grid of bordered download cards, one per PDF. PDFs are at `public/Images/Grundrisse/`.

- [ ] **Step 1: Replace Grundrisse section body**

Find lines 560–568:

```tsx
      {/* Grundrisse */}
      <section id="plans" className="py-16 md:py-32 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-light mb-4 md:mb-6">Grundrisse</h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl">
            Funktionale Raumaufteilung mit Fokus auf Licht und Alltagstauglichkeit.
          </p>
        </div>
      </section>
```

Replace with:

```tsx
      {/* Grundrisse */}
      <section id="plans" className="py-16 md:py-32 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-light mb-4 md:mb-6">Grundrisse</h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mb-10 md:mb-12">
            Funktionale Raumaufteilung mit Fokus auf Licht und Alltagstauglichkeit.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { file: '/Images/Grundrisse/Grundriss_EGs.pdf', label: 'Erdgeschoss' },
              { file: '/Images/Grundrisse/Grundriss_OGs.pdf', label: 'Obergeschoss' },
              { file: '/Images/Grundrisse/Grundriss_DGs.pdf', label: 'Dachgeschoss' },
              { file: '/Images/Grundrisse/Grundriss_UGs.pdf', label: 'Untergeschoss' },
              { file: '/Images/Grundrisse/Grundriss_GalerieEstrich.pdf', label: 'Galerie / Estrich' },
            ].map(({ file, label }) => (
              <a
                key={file}
                href={file}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-gray-200 px-6 py-5 flex justify-between items-center hover:bg-white transition-colors"
              >
                <span className="font-light text-sm">{label}</span>
                <span className="text-xs uppercase tracking-widest text-gray-500">Herunterladen</span>
              </a>
            ))}
          </div>
        </div>
      </section>
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: add PDF download cards to Grundrisse section"
```

---

## Task 6: Google Maps embed in Lage

**Files:**
- Modify: `src/App.tsx:570-587`

**Context:** Add a full-width Google Maps iframe below the address/contact row in the Lage section. No API key required for the embed URL.

- [ ] **Step 1: Add iframe after the contact row**

Find lines 570–587:

```tsx
      {/* Lage */}
      <section id="location" className="py-16 md:py-32 px-6 max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-light mb-4 md:mb-6">Lage</h2>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mb-10 md:mb-12">
          Nesselnbach bietet ländliche Ruhe mit schneller Anbindung an Lenzburg,
          Aarau, Baden, Zürich, Zug und Luzern.
        </p>
        <div className="flex flex-col gap-5 md:flex-row md:gap-8 text-gray-700">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 shrink-0" />
            <span>Niederwilerstrasse, 5524 Nesselnbach</span>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 shrink-0" />
            <a href="mailto:kontakt@widematte.ch" className="hover:opacity-60 transition-opacity">kontakt@widematte.ch</a>
          </div>
        </div>
      </section>
```

Replace with:

```tsx
      {/* Lage */}
      <section id="location" className="py-16 md:py-32 px-6 max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-light mb-4 md:mb-6">Lage</h2>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mb-10 md:mb-12">
          Nesselnbach bietet ländliche Ruhe mit schneller Anbindung an Lenzburg,
          Aarau, Baden, Zürich, Zug und Luzern.
        </p>
        <div className="flex flex-col gap-5 md:flex-row md:gap-8 text-gray-700">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 shrink-0" />
            <span>Niederwilerstrasse, 5524 Nesselnbach</span>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 shrink-0" />
            <a href="mailto:kontakt@widematte.ch" className="hover:opacity-60 transition-opacity">kontakt@widematte.ch</a>
          </div>
        </div>
        <iframe
          src="https://maps.google.com/maps?q=Niederwilerstrasse,5524+Nesselnbach,Switzerland&output=embed"
          className="border-0 w-full h-96 mt-8"
          title="Standort Widematte"
        />
      </section>
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: add Google Maps embed to Lage section"
```

---

## Task 7: Phone number in Contact section

**Files:**
- Modify: `src/App.tsx:1` (import)
- Modify: `src/App.tsx:589-598` (Kontakt section)

**Context:** Add email + phone links in the Kontakt section header, before the form. Phone number: +41 79 583 00 89. Requires importing `Phone` from lucide-react.

- [ ] **Step 1: Add Phone to lucide-react import**

Find line 1:

```tsx
import { Building2, ChevronDown, ChevronLeft, ChevronRight, Mail, MapPin, Menu, Upload, X } from 'lucide-react';
```

Replace with:

```tsx
import { Building2, ChevronDown, ChevronLeft, ChevronRight, Mail, MapPin, Menu, Phone, Upload, X } from 'lucide-react';
```

- [ ] **Step 2: Add email + phone to Kontakt section**

Find lines 589–598:

```tsx
      {/* Kontakt */}
      <section id="contact" className="py-16 md:py-32 px-6 bg-black text-white">
        <div className="max-w-4xl mx-auto md:mx-0">
          <h2 className="text-4xl md:text-6xl font-light mb-4 md:mb-8">Kontakt</h2>
          <p className="text-lg md:text-xl text-gray-400 mb-10 md:mb-12">
            Fordern Sie die Unterlagen an.
          </p>
          <ContactForm initialMessage={prefill} />
        </div>
      </section>
```

Replace with:

```tsx
      {/* Kontakt */}
      <section id="contact" className="py-16 md:py-32 px-6 bg-black text-white">
        <div className="max-w-4xl mx-auto md:mx-0">
          <h2 className="text-4xl md:text-6xl font-light mb-4 md:mb-8">Kontakt</h2>
          <p className="text-lg md:text-xl text-gray-400 mb-6">
            Fordern Sie die Unterlagen an.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 text-gray-300 mb-10 md:mb-12">
            <a href="mailto:kontakt@widematte.ch" className="flex items-center gap-2 hover:opacity-60 transition-opacity">
              <Mail className="w-4 h-4" />
              kontakt@widematte.ch
            </a>
            <a href="tel:+41795830089" className="flex items-center gap-2 hover:opacity-60 transition-opacity">
              <Phone className="w-4 h-4" />
              +41 79 583 00 89
            </a>
          </div>
          <ContactForm initialMessage={prefill} />
        </div>
      </section>
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: add email and phone to Kontakt section header"
```

---

## Task 8: Footer redesign + stub pages

**Files:**
- Modify: `src/App.tsx:600-602`
- Create: `public/impressum.html`
- Create: `public/datenschutz.html`

**Context:** Replace the single copyright line with a 3-row footer: email + phone, Impressum + Datenschutz links, copyright. Create minimal stub HTML pages for the legal links.

- [ ] **Step 1: Replace footer**

Find lines 600–602:

```tsx
      <footer className="py-10 md:py-12 px-6 bg-black text-white border-t border-gray-800">
        <p className="text-sm text-gray-400">© 2026 Widematte</p>
      </footer>
```

Replace with:

```tsx
      <footer className="py-10 md:py-12 px-6 bg-black text-white border-t border-gray-800">
        <div className="max-w-7xl mx-auto space-y-3 text-sm text-gray-400">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <a href="mailto:kontakt@widematte.ch" className="hover:opacity-60 transition-opacity">kontakt@widematte.ch</a>
            <span>·</span>
            <a href="tel:+41795830089" className="hover:opacity-60 transition-opacity">+41 79 583 00 89</a>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <a href="/impressum.html" className="hover:opacity-60 transition-opacity">Impressum</a>
            <span>·</span>
            <a href="/datenschutz.html" className="hover:opacity-60 transition-opacity">Datenschutz</a>
          </div>
          <p>© 2026 Widematte</p>
        </div>
      </footer>
```

- [ ] **Step 2: Create public/impressum.html**

```html
<!doctype html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Impressum – Widematte</title>
  <style>body { font-family: Helvetica Neue, sans-serif; max-width: 600px; margin: 4rem auto; padding: 0 1.5rem; color: #111; } a { color: #111; }</style>
</head>
<body>
  <h1 style="font-weight: 300; font-size: 2rem;">Impressum</h1>
  <p>Inhalt folgt.</p>
  <p><a href="/">← Zurück zur Startseite</a></p>
</body>
</html>
```

- [ ] **Step 3: Create public/datenschutz.html**

```html
<!doctype html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Datenschutz – Widematte</title>
  <style>body { font-family: Helvetica Neue, sans-serif; max-width: 600px; margin: 4rem auto; padding: 0 1.5rem; color: #111; } a { color: #111; }</style>
</head>
<body>
  <h1 style="font-weight: 300; font-size: 2rem;">Datenschutzerklärung</h1>
  <p>Inhalt folgt.</p>
  <p><a href="/">← Zurück zur Startseite</a></p>
</body>
</html>
```

- [ ] **Step 4: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx public/impressum.html public/datenschutz.html
git commit -m "feat: redesign footer and add Impressum/Datenschutz stub pages"
```

---

## Task 9: Favicon

**Files:**
- Create: `public/favicon.svg`
- Modify: `index.html`

**Context:** Add a minimal house SVG as the browser tab icon. Vite serves files from `public/` at the root, so `/favicon.svg` works without configuration.

- [ ] **Step 1: Create public/favicon.svg**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <rect width="24" height="24" fill="white"/>
  <path d="M12 3L2 10.5V21h7v-6h6v6h7V10.5L12 3z" fill="black"/>
</svg>
```

- [ ] **Step 2: Add favicon link to index.html**

In `index.html`, add inside `<head>` before `</head>`:

```html
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
```

The full updated `<head>` section (find the closing `</head>` line and add the link before it):

Current `index.html` ends with:
```html
    <link rel="canonical" href="https://widematte.ch/" />
  </head>
```

Replace with:
```html
    <link rel="canonical" href="https://widematte.ch/" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  </head>
```

- [ ] **Step 3: Verify dev server shows favicon**

```bash
npm run dev
```

Open `http://localhost:5173` in browser. The browser tab should show a small house icon.

- [ ] **Step 4: Commit**

```bash
git add public/favicon.svg index.html
git commit -m "feat: add house SVG favicon"
```

---

## After all tasks: verify full build

```bash
npm run build
```

Expected output ends with:
```
✓ Prerender complete — dist/index.html patched
```

Then:

```bash
npm run preview
```

Open `http://localhost:4173` and verify:
- Building cards show interior renders first in carousel (Buildings 1 and 3)
- Hero shows "5 von 9 Wohnungen verfügbar"
- Availability table has Aussenbereich column (23.74 m² for Gebäude 1 · 1. OG)
- Gebäude 3 · DG "Warteliste" button scrolls to pre-filled contact form
- Grundrisse section shows 5 bordered PDF download cards
- Lage section shows Google Maps iframe
- Kontakt section shows email + phone before the form
- Footer shows email · phone, Impressum · Datenschutz, © 2026 Widematte
- Browser tab shows house icon
- `/impressum.html` and `/datenschutz.html` load with placeholder content
