---
name: verify
description: How to launch and drive the Clipper app to verify changes at runtime.
---

# Verifying Clipper changes

## Launch

The user runs the dev server themselves — **do not start it**. Check for it first:

```sh
lsof -iTCP -sTCP:LISTEN -P | grep -Ei 'node|workerd'
```

Clipper is the vinext dev server on **http://localhost:3000** (node + workerd pair; RSC HTML output). Port 5173 may be a different project ("landing") — confirm by grepping the home HTML for `Clipper`. If no server is up, ask the user to start `npm run dev`.

Local D1 must be seeded: `.wrangler/state/v3/d1` should exist (else `npm run db:migrate:local && npm run db:seed:local`).

## Surfaces worth driving

- `/` — server-rendered booking flow. Packages/neighborhoods come from D1; check they appear in the initial HTML (`curl -s localhost:3000/ | grep "Bath &amp; Brush"`).
- Booking E2E — use the Chrome tools: fill the form, click "Confirm visit"; success client-navigates to `/appointments/CLP-XXXXXX`. Writes to local D1 only (reseed to reset).
- `/appointments` — list with date/money formatting.
- `POST /api/bookings` — 409 when no groomer matches neighborhood+slot.

## Gotchas

- Hydration-mismatch console errors mentioning `cz-shortcut-listen` are from a Chrome extension, not the app.
- Slot labels are hardcoded placeholders (`PLACEHOLDER_SLOTS` in `lib/clipper/data.ts`); `startsAt` is UTC while labels claim KST — a known TODO, not a regression.
- Seed data dates are around 2026-08; placeholder slots are Fri 2026-08-21 / Sat 2026-08-22.
