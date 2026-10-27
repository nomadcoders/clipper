---
name: verify
description: Run Clipper locally and drive the booking flow in Chrome to verify changes.
---

# Verify Clipper

## Launch

- Check for a running server first: `curl -s localhost:3000/api/booking-options`. The user often already has `npm run dev` up on :3000.
- Otherwise run `npm run db:migrate:local`, then `npm run dev`. `npx wrangler d1 migrations list DB --local --config wrangler.jsonc` shows pending migrations without changing anything.
- Avoid `npm run db:seed:local` unless asked. It wipes all rows.
- Inspect the DB with `npx wrangler d1 execute DB --local --config wrangler.jsonc --json --command "<sql>"`. The tables are `appointments`, `groomers`, `groomer_schedules`, and `groomer_service_areas`.

## Booking flow

1. Open `/#book-prism`, fill in the form, and click "Confirm visit →". It POSTs to `/api/bookings` and redirects to `/appointments/<CLP-XXXXXX>`.
2. `/appointments` lists every booking.

## Gotchas

- `/api/booking-options` returns no slots, so the UI shows hardcoded fallback slots (2026-08-21/22, UTC).
- With the seeded data, the **default Itaewon** selection always returns 409. Ava's Friday slots are booked, and nobody covers Itaewon on Saturday. Use **Seongsu-dong + Sat 11:00** for a booking that succeeds.
- A 409 shows only a generic UI error. Read the network response to get the real reason.
