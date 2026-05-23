# Phase 3: Wiring, Linking, and Refactoring

## Current State Analysis
Both `astro-app` and `scraper` currently rely on relative paths to access `src/db` and `src/types`. Since those folders have been relocated, standard imports like `import { db } from '../../src/db'` will fail across the codebase.

## Goals
Update all relative cross-boundary imports to use strictly scoped package names (`@open-setlist/<name>`). Ensure TypeScript resolves these paths cleanly through PNPM workspace symlinks.

## Step-by-Step Changes

### 1. Wire Dependencies
- **apps/web**: Update `package.json` dependencies:
  ```json
  "dependencies": {
    "@open-setlist/db": "workspace:*",
    "@open-setlist/types": "workspace:*"
  }
  ```
- **apps/scraper**: Update `package.json` dependencies similarly to above.
- Run `pnpm install` at the root. PNPM will generate symlinks mapping `@open-setlist/db` to `packages/db`.

### 2. Refactor Imports Globally
- Search for `../src/db` and `../../src/db`. Replace with:
  `import ... from '@open-setlist/db';`
- Search for `../src/types` and `../../src/types`. Replace with:
  `import ... from '@open-setlist/types';`
- Ensure that `packages/db/package.json` properly exports the files needed by the scraper and web frontend (using `"exports": { ".": "./index.ts" }`).

### 3. Handle Special Pathings (Assets/Config)
- Fix references to database seeding (e.g., `schema.sql` and `seed.sql`). Scripts previously in `bin/` and `root/package.json` will need to target `packages/db/schema.sql`.

## Acceptance Criteria & Tests
- [ ] TypeScript compiler passes in all apps individually (`pnpm -F @open-setlist/web exec tsc --noEmit` and `pnpm -F @open-setlist/scraper exec tsc --noEmit`).
- [ ] The `packages/db` logic can be imported directly without "module not found" errors.
- **Regression Prevention**: 
  - Run the `apps/web` dev server (`pnpm turbo run dev --filter=@open-setlist/web`). Navigate to the site locally; verify database hits function.
  - Run the scraper locally (`pnpm turbo run scrape --filter=@open-setlist/scraper`). Verify it initializes and accesses the database properly.