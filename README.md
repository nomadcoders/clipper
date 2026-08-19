# Clipper

Clipper is an at-home dog grooming service in Seoul. Customers pick a package, choose a time, and a groomer comes to them. This is the booking application.

It runs as a vinext application on Cloudflare Workers and uses a local Cloudflare D1 database.

## Run Clipper locally

You need a recent Node.js installation. A Cloudflare account is not required for local development.

From the cloned `clipper` directory, install the dependencies:

```sh
npm install
```

Create the local D1 database by applying the initial migration:

```sh
npm run db:migrate:local
```

Add the starter groomers, packages, schedules, and appointments:

```sh
npm run db:seed:local
```

Start the development server:

```sh
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). If that port is already occupied, vinext will print the alternative local URL in the terminal.

The migration and seed commands only need to be run the first time you clone the repository. Wrangler stores the generated local database in `.wrangler/`, which is excluded from Git.

## How a booking works

A booking starts on the landing page and ends on an appointment page with a `CLP-XXXXXX` reference.

1. **The server page loads the options.** `app/page.tsx` is `force-dynamic` and calls `getBookingOptions()` in `lib/clipper/data.ts`, which reads the grooming packages and the distinct neighborhoods that groomers serve. Arrival times are still a hardcoded `PLACEHOLDER_SLOTS` list in that file — they are not derived from real schedules yet.
2. **The customer fills in the flow.** Those options are passed as props into `components/clipper/booking-flow.tsx`, a `"use client"` component that collects the pet, package, neighborhood, address, and start time.
3. **The client posts to the API.** On submit it `POST`s JSON to `/api/bookings` (`app/api/bookings/route.ts`).
4. **The Worker validates and prices the booking.** The route requires every field to be a non-empty string and `startsAt` to parse as a date, then loads the package from the database. Duration and price always come from that package row, never from the request body; `endsAt` is derived from `startsAt` plus the package duration.
5. **A groomer is assigned.** `findAvailableGroomer()` intersects `groomer_service_areas` (matching neighborhood) with `groomer_schedules` (matching UTC weekday, and a window that covers the requested `HH:MM` range), then drops any groomer with an overlapping non-cancelled appointment. It returns the first survivor, or `null`.
6. **The response.** No groomer available means `409` and no row written. Otherwise the appointment is inserted with status `confirmed` and the route returns `{ ok: true, reference }`.
7. **Confirmation.** The client redirects to `/appointments/<reference>`, which server-renders the appointment via `getAppointmentByReference()`.

All times are handled in UTC, and schedule comparisons are plain `HH:MM` string comparisons.

## Available commands

- `npm run dev` starts the vinext development server.
- `npm run build` builds the Cloudflare Worker output.
- `npm run start` runs the built Worker locally with Wrangler.
- `npm run db:migrate:local` applies pending migrations to local D1.
- `npm run db:seed:local` resets and seeds the starter data.
- `npm run deploy` deploys the application to Cloudflare.
