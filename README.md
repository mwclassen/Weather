# 15-Day Weather Forecast

A dark, terminal-inspired weather dashboard with city search and a 15-day forecast powered by [Open-Meteo](https://open-meteo.com/). Favorites and temperature unit preferences are stored in [Supabase](https://supabase.com/).

## Features

- Search any city via Open-Meteo Geocoding API
- 15-day daily forecast (temp, precip, wind, conditions)
- Current conditions hero panel
- Temperature trend sparkline
- Pin favorite cities (Supabase)
- °C / °F preference synced to Supabase

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The app works without Supabase — search and forecasts still load. Favorites and unit persistence require Supabase env vars.

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run the migration in [`supabase/migrations/001_initial.sql`](supabase/migrations/001_initial.sql).
3. Copy **Project URL** and **anon public** key from **Settings → API**.
4. Create `.env.local` from the example:

```bash
cp .env.local.example .env.local
```

Fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

5. Restart `npm run dev`.

### Security note

v1 uses a browser-generated `client_id` in `localStorage` with permissive RLS policies suitable for a personal project. For production or shared devices, add [Supabase Auth](https://supabase.com/docs/guides/auth) and tighten RLS to `auth.uid()`.

## Open-Meteo

No API key is required. Data is free for non-commercial use — see [Open-Meteo terms](https://open-meteo.com/en/terms).

## Tech stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS v4
- TanStack React Query
- Supabase JS client
- Lucide icons

## Scripts

| Command        | Description          |
|----------------|----------------------|
| `npm run dev`  | Development server   |
| `npm run build`| Production build     |
| `npm run start`| Production server    |
| `npm run lint` | ESLint               |

