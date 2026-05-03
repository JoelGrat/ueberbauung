# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # install dependencies
npm run dev          # start dev server (http://localhost:5173)
npm run build        # type-check + production build
npm run preview      # preview production build locally
```

No test runner or linter is configured.

## Environment

Copy `.env.example` to `.env` and set:
- `VITE_SUPABASE_URL` – Supabase project URL
- `VITE_SUPABASE_ANON_KEY` – Supabase anon/public key
- `VITE_SUPABASE_BUCKET` – storage bucket name (defaults to `"images"`)

The app works without these vars; images simply won't load.

## Architecture

Everything lives in `src/App.tsx`. There is no routing — the page uses anchor-based scroll navigation.

**Data layer** — apartment data (`Apartment[]`) is hardcoded. Nine units across three buildings (A, B, C), two floors each. There is no CMS or database table for unit data.

**Image layer** — `ApartmentImage` records are fetched from the Supabase table `apartment_images` (columns: `apartment_id`, `image_type`, `storage_path`). Images are served from Supabase Storage. If `image_type === 'hero'`, the image is used as the card thumbnail; otherwise a per-building fallback filename is used. The hero background (`Aussenansicht.jpg`) is a public-bucket URL built at module load time.

**Supabase client** — initialized once at module scope; is `null` when env vars are absent. Components check for `null` before making requests.

**Components**
- `ApartmentCard` – renders a single unit with its image, floor label, size, room count, and CHF price
- `App` – root component; fetches images on mount, groups units by building, renders five sections: Hero · Wohnungen · Grundrisse · Lage · Kontakt

**Styling** — Tailwind CSS with the default font overridden to `"Helvetica Neue"`. Design language is minimal/Swiss: large light-weight headings, black/white/gray palette, no rounded corners.

**Language** — all user-visible text is German (Swiss market).
