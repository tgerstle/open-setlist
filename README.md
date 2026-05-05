# MKE Setlist - Scraper & Frontend

This project is a monorepo for scraping Milwaukee concert venues and displaying them in an Astro-based frontend.

## Project Structure

- `src/scrapers/`: Scraper engine and venue-specific plugins.
- `src/db/`: SQLite database schema and helper functions.
- `astro-app/`: Frontend website built with Astro.
- `data/`: SQLite database file (`mkesetlist.db`).
- `logs/`: Scraper audit logs (JSON) and error screenshots.

## Getting Started

### 1. Installation

```bash
npm install
npm run web:install
```

### 2. Database Setup

Initialize the SQLite database with the schema and seed data:

```bash
npm run db:init
```

### 3. Running the Scraper

To run the scraper and update the local database:

```bash
npm run scrape
```

**How it works:**
1. The `runner.ts` iterates through venues defined in `src/scrapers/runner.ts` (or `src/scrapers/index.ts`).
2. It uses **Playwright** to navigate to the venue website.
3. Venue-specific plugins (e.g., `src/scrapers/plugins/pabst.ts`) parse the page and return show data.
4. Results are upserted into `data/mkesetlist.db` and an audit log is written to `logs/`.

### 4. Testing

This project uses **Vitest**.

- **Run all tests:** `npm test`
- **Run specific test:** `npm test tests/pabst_plugin.test.ts`
- **Watch mode:** `npm run test:watch`

## Troubleshooting "0 results on frontend"

If you run `npm run build` or `npm run dev` and see 0 shows:

1. **Check the Admin Dashboard (Dev-Only):**
   Run the dev server and visit `http://localhost:4321/admin/dashboard` to see real-time scraper updates.
2. **Inspect Latest via CLI:**
   ```bash
   npx tsx bin/admin-latest.ts
   ```
3. **Check the Scraper Logs:** Look in `logs/scraper-pabst-theater-YYYY-MM-DD.json` to see if the last run found any shows.
4. **Inspect the Database:**
   ```bash
   sqlite3 data/mkesetlist.db "SELECT count(*) FROM shows;"
   ```
5. **Re-Scrape:** Run `npm run scrape` to ensure the database is populated before building the frontend.
6. **Build Order:** The frontend fetches data at **build time**. If you update the scraper results, you must rebuild the frontend:
   ```bash
   npm run build
   ```

## Development Loop

1. **Research:** Analyze venue site changes.
2. **Test:** Add/update a test in `tests/` using a static HTML snippet.
3. **Implement:** Update the plugin in `src/scrapers/plugins/`.
4. **Verify:** Run the scraper (`npm run scrape`) and check the database.
