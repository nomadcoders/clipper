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

## Available commands

- `npm run dev` starts the vinext development server.
- `npm run build` builds the Cloudflare Worker output.
- `npm run start` runs the built Worker locally with Wrangler.
- `npm run db:migrate:local` applies pending migrations to local D1.
- `npm run db:seed:local` resets and seeds the starter data.
- `npm run deploy` deploys the application to Cloudflare.
