# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Clipper is a booking app for an at-home dog grooming service in Seoul. It is a **vinext** app (Next.js-compatible App Router running on Vite + React Server Components) deployed to **Cloudflare Workers**, with **Cloudflare D1** (SQLite) accessed through **Drizzle ORM**.

## Commands

```sh
npm run dev                 # dev server (vinext) — the user runs this themselves; do not start it
npm run build               # build Worker output into dist/
npm run start               # run built Worker: wrangler dev --config dist/server/wrangler.json
npm run preview             # build + start
npm run deploy              # deploy to Cloudflare
npm run db:migrate:local    # wrangler d1 migrations apply DB --local (drizzle/ dir)
npm run db:seed:local       # resets and re-seeds from scripts/seed.sql
npm run cf-typegen          # regenerate worker-configuration.d.ts after wrangler.jsonc binding changes
```

There is no lint, test, or typecheck script. For a type check use `npx tsc --noEmit`.

Local D1 lives in `.wrangler/` (gitignored). Migrate + seed once after cloning.

## Architecture

- `app/` — App Router. Server pages call the data layer directly; `app/api/*/route.ts` are Worker route handlers for the client.
- `lib/clipper/db.ts` — the only sanctioned way to get a DB client: `getDatabase()` reads the `DB` binding off `env` from `cloudflare:workers` and wraps it with Drizzle. New DB code should use it rather than re-creating a drizzle client.
- `lib/clipper/data.ts` — all query logic (booking options, appointment lookup by reference, `findAvailableGroomer`). Availability matching intersects `groomer_service_areas` + `groomer_schedules` (weekday + HH:MM string comparison, UTC) and then excludes groomers with overlapping non-cancelled appointments.
- `lib/clipper/types.ts` — view models derived from Drizzle `$inferSelect`. Note timestamps are `timestamp_ms` integers in the DB but serialized to ISO **strings** in `AppointmentDetails` so they can cross the server/client boundary.
- `db/schema.ts` — Drizzle schema, the single source of truth for tables. `drizzle/` holds the generated SQL migrations plus `meta/` snapshots; `drizzle.config.ts` targets the sqlite dialect.
- `components/clipper/` — feature components. `booking-flow.tsx` is the main `"use client"` flow: it receives booking options as props from the server page and posts to `/api/bookings`, which assigns a groomer and returns a `CLP-XXXXXX` booking reference. `home-variants.tsx` holds the landing page composition rendered by `app/page.tsx`.
- `components/ui/` — shadcn/ui (new-york style, neutral base, Tailwind v4 via `@tailwindcss/postcss`, tokens in `app/globals.css`). Import from the `@/components/ui` barrel.

Path alias: `@/*` maps to the repo root.

## Conventions

- Booking writes go through `POST /api/bookings`: validate string fields, resolve the package for `durationMinutes`/`priceCents`, derive `endsAt`, call `findAvailableGroomer`, return `409` when nothing is available. Keep price and duration server-derived from the package, never from the request body.
- Styling is inline Tailwind with hardcoded brand hex values (`#635bff`, `#0a2540`, `#f7f9fc`) in the clipper components — match the surrounding file rather than introducing new tokens.
- No test runner exists. Don't invent one; use npx tsc --noEmit.
