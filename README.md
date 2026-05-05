# Local Live Music Tracker

An open-source boilerplate for building a hyper-local, community-driven live music tracker. Created with Astro, React, Tailwind, SQLite, and Playwright.

This project is divided into two parts:
1. **The Scraper Engine:** A robust Playwright + Stealth system designed to automate fetching shows from varied local venue websites.
2. **The Frontend:** An Astro SSG + React SPA hybrid that displays an interactive feed and map of all upcoming shows.

## Prerequisites
- Node.js (v20+)
- npm

## Quick Start

Get the boilerplate running locally in less than 5 minutes.

```bash
# 1. Install dependencies
npm install
npm run web:install

# 2. Setup your local environment
cp .env.example .env
cp astro-app/.env.example astro-app/.env

# 3. Initialize your SQLite Database & Seed Mock Data
npm run db:init
npx tsx bin/generate-mock-db.ts --venues 5 --shows 20

# 4. Start the Development Server
npm run dev
```

Your local interface will now be available at `http://localhost:4321`.

## Architecture

### The Scraper (`scraper/`)
A scalable plugin system exists in `scraper/plugins/`. You simply export a function that takes a Playwright `Page` and a `venue_id`, scrapes the relevant calendar, and returns an array of `ScraperShow` objects. The core runner takes care of proxy obfuscation, stealth browser instantiation, audit saving, and intelligent database upserting.

### The UI (`astro-app/`)
Driven by Astro, utilizing `nanostores` for client-side state across independent React components (like the Venue Map and Feed List). The SQLite database is directly interrogated via Better-SQLite3. All styling is localized to generic `brand-*` tailwind classes.

## Contributing
Feel free to open issues or PRs addressing the core boilerplate stability. For your own local instance, simply fork or clone this repository and customize the `generate-mock-db.ts` and UI layout to fit your city!
