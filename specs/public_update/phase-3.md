# Phase 3: Branding & Configuration Scrubbing

## Goals
Scrub all personal references, regional branding ("Milwaukee", "MKE"), and hardcoded map coordinates to make the application fully generic and ready for configuration via env variables.

## Code/Files to Edit or Delete
1. **Package Details:**
   - `package.json` (root) and `astro-app/package.json`:
     - Rename project to `local-live-music-tracker` (or similar).
     - Reset `version` to `"0.1.0"`.
     - Remove specific author descriptions/URLs.
   - `playwright.config.ts` and `astro-app/astro.config.mjs`: Rename project titles.
2. **Database & Core Logic:**
   - *Database Name:* Replace references of `mkesetlist.db` with `localmusic.db` in:
     - `astro-app/src/lib/db.ts`
     - `astro-app/src/lib/admin-db.ts`
     - `astro-app/src/pages/index.astro`, `calendar.astro`, `map.astro`, etc.
   - *Schema Change:* In `src/db/schema.sql` and corresponding types, rename `is_mke_local` to `is_local`. Find/replace references in queries appropriately.
3. **Tailwind & Colors:**
   - `astro-app/tailwind.config.mjs`: Rename the `mke` theme group (e.g., `mke-blue-dark`, `mke-gold`) to a generic `brand` group (e.g., `brand-primary`, `brand-accent`). 
   - Perform a global Find & Replace across `astro-app/src/**/*.astro` and `*.tsx` swapping `mke-` with `brand-`.
4. **UI & SEO Generalization:**
   - **Text Replacements:** Replace "Milwaukee", "MKE Setlist", "MKE" with "Demo City", "Local Music Tracker", or "Live Music" in:
     - `astro-app/src/layouts/Layout.astro`
     - `astro-app/src/pages/index.astro`, `calendar.astro`, `contact.astro`, `map.astro`, `privacy.astro`, `terms.astro`
     - `astro-app/src/components/ui/AppHeader.tsx`, `ShowDetailDrawer.tsx`
     - `astro-app/src/components/Logo.astro`
5. **Map Coordinates:**
   - `astro-app/src/components/VenueMap.tsx` and `MapView.tsx`:
     - Replace hardcoded `[43.0389, -87.9065]` with a generic starting coordinate or an environment variable `PUBLIC_MAP_CENTER`. Fallback to `[39.8283, -98.5795]` (US Center).

## Tests/Validation to Run
- Code cleanly compiles: `npm run build` and `npx tsc --noEmit`.
- Run E2E specs and make sure text assertions don't fail due to changed site titles: `npm run test:e2e` (Playwright).