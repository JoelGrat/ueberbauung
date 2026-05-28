# Page Improvements Design

**Date:** 2026-05-28  
**Status:** Approved

## Overview

Ten improvements to the Widematte real estate site, split between pure code changes and asset-wiring.

---

## 1. Image Compression (user action, not code)

All images in `public/Images/` are 46–64 MB raw renders. Must be re-exported at 1920×1080 JPEG quality 80 (target ≤ 500 KB each) before production. No code change needed.

---

## 2. Grundrisse Section — PDF Downloads

Replace the empty section body with a 2-column grid of bordered download cards.

**PDFs available in `public/Images/Grundrisse/`:**

| File | Label |
|---|---|
| `Grundriss_EGs.pdf` | Erdgeschoss |
| `Grundriss_OGs.pdf` | Obergeschoss |
| `Grundriss_DGs.pdf` | Dachgeschoss |
| `Grundriss_UGs.pdf` | Untergeschoss |
| `Grundriss_GalerieEstrich.pdf` | Galerie / Estrich |

Each card: floor label (font-light) + "Herunterladen" link (`target="_blank"`, `rel="noopener"`). Bordered box, no thumbnail. 2-column grid on desktop, 1-column on mobile.

---

## 3. Lage Section — Google Maps Embed

Add a full-width Google Maps iframe (h-96, no API key required) below the address/contact row.

```
src="https://maps.google.com/maps?q=Niederwilerstrasse,5524+Nesselnbach,Switzerland&output=embed"
```

Styled with `border-0 w-full h-96 mt-8`.

---

## 4. Building Card Images — Interior Renders

Update `buildingImagePaths` in `App.tsx` to include interior renders from `public/Images/Innenansicht/`:

```ts
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
```

---

## 5. Phone Number

**Number:** +41 79 583 00 89 (display format), `tel:+41795830089` (href)

Add to:
- **Contact section header** — alongside the email, as a `<a href="tel:+41795830089">` with a Phone icon
- **Footer** — alongside the email line

---

## 6. Outdoor Space in Availability Table

Add an "Aussenbereich" column to both the desktop table and mobile cards.

- Show value as `{apt.outdoor} m²` when `apt.outdoor` is defined
- Show `—` when undefined
- Desktop: new `<th>` between NWF and Preis
- Mobile: new row in the detail grid when `apt.outdoor` is defined

---

## 7. Availability Count in Hero

Add a line below the tagline paragraph, computed live from `apartments`:

```tsx
const availableCount = apartments.filter(a => a.status === 'available').length;
// → "5 von 9 Wohnungen verfügbar"
```

Styled: `text-sm text-gray-300 mt-4 tracking-wide`

---

## 8. Footer Redesign

Replace the single copyright line with:

```
kontakt@widematte.ch  ·  +41 79 583 00 89
Impressum  ·  Datenschutz
© 2026 Widematte
```

- Email and phone as anchor tags
- Impressum and Datenschutz link to `/impressum.html` and `/datenschutz.html` (stub pages created in `public/`)
- Stub pages: minimal HTML with "Inhalt folgt" placeholder

---

## 9. Warteliste CTA

The reserved apartment (Gebäude 3 · DG) currently shows an inert "Warteliste" label. Make it clickable — same behaviour as "Unterlagen anfordern" but pre-filled:

```
"Ich interessiere mich für Gebäude 3 · DG und möchte auf die Warteliste gesetzt werden."
```

Applies to both the desktop table and mobile cards. In App.tsx, extend `requestInfo` to handle `status === 'reserved'` the same way as `'available'`, or add a separate `requestWaitlist(apt)` handler.

---

## 10. Favicon

Create `public/favicon.svg` — a simple house SVG (black on white, matches minimal style):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <rect width="24" height="24" fill="white"/>
  <path d="M12 3L2 10.5V21h7v-6h6v6h7V10.5L12 3z" fill="black"/>
</svg>
```

Add to `index.html` `<head>`:
```html
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
```

---

## Files Changed

| File | Change |
|---|---|
| `src/App.tsx` | buildingImagePaths, hero count, availability table outdoor col, warteliste CTA, phone in contact, Grundrisse section, Lage map, footer |
| `index.html` | favicon link |
| `public/favicon.svg` | new — house SVG |
| `public/impressum.html` | new — stub |
| `public/datenschutz.html` | new — stub |
