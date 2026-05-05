# Phase 2: Scraper Generalization

## Goals
Remove strict dependencies on Milwaukee-specific venue scrapers. Create a single interface demonstrating best practices for building an integration layer.

## Code/Files to Edit or Delete
1. **Clean Scrapers:**
   - Remove `scraper/plugins/*` except for any core/shared functionality.
   - Specifically delete files like `bremen.ts`, `cactus.ts`, `pabst.ts`, `cooperage.ts`, `falcon.ts`, `jazzestate.ts`, `linnemans.ts`, `madplanet.ts`, `miramar.ts`, `rave.ts`, `shank.ts`, `xray.ts`.
   - Delete venue-specific scripts in `scraper/core/`: `research_cactus.ts`, `research_pabst.ts`.
2. **Create Template:**
   - Create `scraper/plugins/example-venue.ts`. This file should export an `examplePlugin` implementing the standard plugin interface and returning generic mocked `ShowData` (or returning empty sets with comments explaining real-world implementation).
3. **Update Runner:**
   - Edit `scraper/core/runner.ts` (and `bin/admin-latest.ts`, `bin/mke-admin.ts` if relevant). Remove the array of old venue plugins and safely replace it with `[examplePlugin]` with proper type-checking.

## Tests/Validation to Run
- Run tests via `npm run test` (`vitest`) to ensure no missing module errors or test suites depend on missing scrapers.
- Ensure `tests/scraper.test.ts` passes the generic core runner logic even with the empty/mock plugin.