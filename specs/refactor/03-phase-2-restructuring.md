# Phase 2: App and Package Restructuring

## Current State Analysis
The system's modularity is largely implicit via folder architecture (`astro-app/`, `scraper/`, `src/db/`).
`astro-app/` has its own `package.json`, but `scraper/`, `src/db/`, and `src/types/` rely on the root `package.json`, creating environment bleed (the scraper gets access to all frontend dependencies installed at root, if any were hoisted, and vice-versa).

## Goals
Physically migrate folders into `apps/` and `packages/` domains and establish minimal `package.json` boundaries for each context.

## Step-by-Step Changes

### 1. Applications (`apps/`)
- Move `astro-app/` -> `apps/web/`.
  - Update `apps/web/package.json` name to `@open-setlist/web`.
  - Add workspace dependency: `"@open-setlist/tsconfig": "workspace:*"` and inherit the shared TS config.
- Move `scraper/` -> `apps/scraper/`.
  - Create `apps/scraper/package.json` (name: `@open-setlist/scraper`).
  - Move necessary node dependencies from Root `package.json` directly into this new file (e.g., `playwright`, `playwright-extra`, `puppeteer-extra-plugin-stealth`, `tsx`).

### 2. Shared Libraries (`packages/`)
- Move `src/db/` -> `packages/db/`.
  - Create `packages/db/package.json` (name: `@open-setlist/db`, main: `index.ts`).
  - Move dependencies to this `package.json`: `better-sqlite3`, `sqlite3` (if utilized here), `@types/better-sqlite3`.
  - Expose `index.ts`, `schema.sql`, and `admin-queries.ts` in the package `exports`.
- Move `src/types/` -> `packages/types/`.
  - Create `packages/types/package.json` (name: `@open-setlist/types`, main: `index.ts`).
- Move scripts in `bin/` and `data/` either to the root folder strictly for workspace initiation, or directly into the app folders they impact (e.g., `apps/scraper/bin/`).

### 3. Root Package Pruning
- Strip out any non-orchestration dependencies from the root `package.json`. It should now primarily contain `turbo` and workspace management utilities.

## Acceptance Criteria & Tests
- [ ] Directory structure perfectly matches standard Monorepo architecture (`apps/` and `packages/`).
- [ ] Run `pnpm install` successfully at root.
- **Regression Prevention**: No files inside these folders should be internally modified yet; imports are currently broken, which leads directly into Phase 3.