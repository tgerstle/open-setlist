# Phase 1: Foundation and Tooling Setup

## Current State Analysis
Right now, the front-end application lives in `astro-app/`, using Astro/React/Tailwind and a `biome.json` for formatting. 
The background service logic (`scraper/`), shared code (`src/db`, `src/types`), and scripts (`bin/`) are handled at the root level via a somewhat bloated `package.json` utilizing `tsx`, `better-sqlite3`, and `playwright`.
There is no consistent TS configuration at the root level.
Dependencies in `astro-app/package.json` overlap with testing concepts from the root (e.g., both use `vitest` and `playwright`).

## Goals
Establish PNPM as the orchestrator and configure shared tooling without modifying current functionality.

## Step-by-Step Changes

### 1. Root PNPM Workspace Config
- Create `pnpm-workspace.yaml` at the root.
- Define `packages:*` and `apps:*` in the workspace configuration.

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### 2. Turborepo Setup
- Install Turborepo at the project root: `pnpm add -D turbo -w`. 
- Create `turbo.json` with the following pipeline topology:
  - `build`: depends on `^build` (dependencies build first), outputs `dist/**`.
  - `dev`: cache `false`, persistent `true` for Astro and Scraper dev services.
  - `lint`: runs Biome/ESLint checks.
  - `test`: depends on `build`, runs `vitest run`.
  - `test:e2e`: depends on `build`, runs Playwright.

### 3. Extract Shared Configurations
- **TypeScript**: We lack a root tsconfig. We will create `packages/config-typescript` housing:
  - `package.json` (name: `@open-setlist/tsconfig`)
  - `base.json`, `astro.json`, `node.json` tailored for the specific app needs.
- **Linting/Formatting**: 
  - Move `astro-app/biome.json` into a new package: `packages/config-biome/biome.json`.
  - Create `packages/config-biome/package.json` (name: `@open-setlist/biome-config`).

## Acceptance Criteria & Tests
- [ ] Run `pnpm install`. It should link the workspace packages appropriately without failing.
- [ ] Run `pnpm turbo run test` should safely error out regarding missing test scripts, proving Turbo is correctly invoked as the orchestrator.
- **Regression Prevention**: Nothing has been moved yet. `cd astro-app && npm run build` and root `npm run scrape` should still function flawlessly.