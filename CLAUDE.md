# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Runtime

- This is a **vinext** app (Next.js App Router API on Vite), deployed to **Cloudflare Workers**, not a real Next.js app. Don't use `next` CLI commands. `next.config.ts` and `next-env.d.ts` exist only for compatibility; the real build config is `vite.config.ts` and `wrangler.jsonc`.
- Code runs in the Workers runtime. Bindings come from `import { env } from "cloudflare:workers"`, not `process.env`. Use `getDatabase()` in `lib/clipper/db.ts` for the D1 (`DB`) binding.
- After you change bindings in `wrangler.jsonc`, run `npm run cf-typegen` to regenerate `worker-configuration.d.ts`.

## Database (D1 + Drizzle)

- The schema is in `db/schema.ts`. Migrations live in `drizzle/`, which is also Wrangler's `migrations_dir`. After a schema change, run `npx drizzle-kit generate` and then `npm run db:migrate:local`.
- `npm run db:seed:local` **deletes all rows** before reseeding from `scripts/seed.sql`.
- Timestamps are stored as `timestamp_ms` integers, and data helpers return them as ISO strings.
- Groomer availability (`findAvailableGroomer`) compares `groomer_schedules.weekday` and the `HH:MM` start/end times against the booking's **UTC** day and time, not Seoul local time.

## Checking changes

- There is no test suite or linter. Verify changes with `npx tsc --noEmit`.

## Code style

- Use the `@/*` import alias, which resolves to the repo root.
- UI primitives are shadcn/ui ("new-york" style) in `components/ui`. App components go in `components/clipper`.
