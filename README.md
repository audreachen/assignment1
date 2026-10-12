# Album Journeys 🍓💿

An interactive album discovery and music scrapbook built with Next.js, Supabase, and Gemini.

## Features

- Explore 14 albums and their individual listening-journey pages.
- Generate illustrative running-energy maps using Gemini, then match them to albums.
- Rate generated maps and revisit your saved ratings.
- Sign up or sign in to keep a private scrapbook with notes, photos, and stickers.
- Save journal content and profile images to Supabase with row-level security and private storage.
- Server-side, database-backed rate limiting for AI generation.

Energy maps are illustrative interpretations, not measured audio features.

## Local development

Install dependencies with `npm install` and run `npm run dev`.

Set these environment variables:

```
GEMINI_API_KEY=
NEXT_PUBLIC_ALBUM_JOURNEYS_SUPABASE_URL=
NEXT_PUBLIC_ALBUM_JOURNEYS_SUPABASE_KEY=
```

The Gemini API key must remain server-only. Configure Supabase tables, policies, and private storage buckets before testing saved features.

## Deployment

Deploy the `album-journeys` branch on Vercel and configure the same environment variables in the Preview environment. The original `main` branch is kept unchanged.
