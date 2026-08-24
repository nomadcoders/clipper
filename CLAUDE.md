# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

Next.js App Router source conventions, but **not run by the `next` CLI**. It runs on [vinext](https://github.com/cloudflare/vinext) (Vite) targeting Cloudflare Workers. `next.config.ts` is a vestigial empty stub — the real build config is `vite.config.ts`. Data lives in Cloudflare D1 (SQLite) accessed through Drizzle ORM.

Package manager is npm (`packageManager: npm@10.9.2`).

## First-run setup (ordered, mandatory)

```
npm install
npm run db:migrate:local
npm run db:seed:local
npm run dev            # port 3000
```

Without migrate + seed the app renders but `/api/booking-options` returns 500. The local D1 database lives in `.wrangler/` and is gitignored — wiping it loses all booked appointments; re-run migrate + seed.

`npm run start` requires `npm run build` first (it reads `dist/server/wrangler.json`, which only exists post-build).

## Verifying a change

There is no linter, formatter, or test suite. Verify with:

```
npx tsc --noEmit
```

Do not add or invoke lint/test scripts that don't exist.

## Database changes

1. Edit `db/schema.ts` (the only schema file).
2. Run `npx drizzle-kit generate` to emit SQL into `drizzle/`. There is no `db:generate` script.
3. `npm run db:migrate:local`.

Never hand-write migration SQL into `drizzle/` or edit `drizzle/meta/*`.

`scripts/seed.sql` is **destructive** — it `DELETE`s from all five tables before inserting. `npm run db:seed:local` is a reset, not an append.

The D1 binding is `DB`, reached via `getDatabase()` in `lib/clipper/db.ts` (which uses `import { env } from "cloudflare:workers"`). There are no environment variables anywhere in this project — no `process.env` usage, no `.env`. All config comes from `wrangler.jsonc` bindings.

## Conventions

- Import alias `@/*` maps to the **repo root**, not `src/` (there is no `src/`): `@/db/schema`, `@/lib/clipper/data`, `@/components/ui`.
- Tailwind CSS v4 with **no `tailwind.config.*`** — theme config is CSS-first in `app/globals.css` (`@import "tailwindcss"`, `@theme inline`). shadcn/ui, style `new-york`.
- Drizzle column modes: timestamps are `integer(..., { mode: "timestamp_ms" })`, booleans are `integer(..., { mode: "boolean" })`.
- Pages that read the DB set `export const dynamic = "force-dynamic"`.
- Named exports for components; `"use client"` on interactive ones.

## Do not edit (generated)

`worker-configuration.d.ts` (regenerate with `npm run cf-typegen`), `next-env.d.ts`, `drizzle/*.sql` and `drizzle/meta/*`, `.next/`, `.vinext/`, `.wrangler/`, `dist/`, `tsconfig.tsbuildinfo`.

## Dependencies

React, vinext, vite, typescript, tailwindcss and others are pinned to `"latest"` **on purpose** (tracking the vinext beta). Do not change versions in `package.json` or run `npm update` / add dependencies unprompted.

## Known issues

- `/api/booking-options` returns only `{ packages, neighborhoods }`, but `components/clipper/booking-flow.tsx` expects `availableSlots` / `slots`. No slots endpoint exists, so the slot list is always empty and booking submission always fails its `!selectedSlot` guard.
- Time handling is inconsistent: `findAvailableGroomer` in `lib/clipper/data.ts` compares schedules in UTC (`getUTCDay`/`getUTCHours`) while `app/appointments/page.tsx` formats with local-time `getHours()`. The product is Seoul-based (KST).
- `/appointments` lists every appointment in the database to anyone — there is no auth of any kind in this app.
- Two competing color systems coexist: hardcoded hex values inline (`#635bff`, `#0a2540`, `#f7f9fc` on home/appointments; a warm cream palette on error/not-found) alongside the shadcn CSS variables in `app/globals.css`.
