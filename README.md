# Local Live Music Tracker

An open-source boilerplate for building a hyper-local, community-driven live music tracker. Created with Astro, React, Tailwind, SQLite, and Playwright.

This project is divided into two parts:
1. **The Scraper Engine:** A robust Playwright + Stealth system designed to automate fetching shows from varied local venue websites.
2. **The Frontend:** An Astro SSG + React SPA hybrid that displays an interactive feed and map of all upcoming shows.

## Prerequisites
- Node.js (v20+)
- pnpm (v11+)

## Quick Start

Get the boilerplate running locally with a single command.

```bash
# 1. Install dependencies
pnpm install

# 2. Run the automated setup script
# This configures .env files, initializes the SQLite database, and seeds mock data.
pnpm run setup

# 3. Start the development server
pnpm run dev
```

Your local interface will now be available at `http://localhost:4321`.

### Resetting the Environment
If you ever want to wipe your local database, environment variables, and node_modules to start completely over from a clean slate, run:
```bash
pnpm run reset
```

## Customizing for Your City
By default, the mock database generator (`bin/generate-mock-db.ts`) puts pins down near Milwaukee, WI, and the `.env` default overrides point to that map center.
*   Update `PUBLIC_MAP_CENTER` in `apps/web/.env`
*   Update the bounding box latitude/longitude limits in `bin/generate-mock-db.ts`
*   Begin adding your own venue plugins using `apps/scraper/plugins/example-venue.ts` as a template!

## Architecture
This project is structured as a PNPM Monorepo managed by Turborepo.

### The Scraper (`apps/scraper/`)
A scalable plugin system exists in `apps/scraper/plugins/`. You simply export a function that takes a Playwright `Page` and a `venue_id`, scrapes the relevant calendar, and returns an array of `ScraperShow` objects. The core runner takes care of proxy obfuscation, stealth browser instantiation, audit saving, and intelligent database upserting.

### The UI (`apps/web/`)
Driven by Astro, utilizing `nanostores` for client-side state across independent React components (like the Venue Map and Feed List). All styling is localized to generic `brand-*` tailwind classes.

### Shared Packages (`packages/`)
- `@open-setlist/db`: Better-SQLite3 connection instances, schema definitions, and shared data queries.
- `@open-setlist/types`: Shared TypeScript definitions across the stack.
- Config packages for TypeScript and Biome formatting.

## Contributing
Feel free to open issues or PRs addressing the core boilerplate stability. For your own local instance, simply fork or clone this repository and customize the `generate-mock-db.ts` and UI layout to fit your city!
