# Monorepo Migration Plan (PNPM + Turborepo)

## Phase 1: Foundation and Tooling Setup
**Goal:** Establish the monorepo workspace structure and configure caching/orchestration without disrupting existing code yet.

1. **Initialize PNPM Workspace:**
   - Create `pnpm-workspace.yaml` specifying `apps/*` and `packages/*`.
   - Update the root `package.json` to act as the workspace orchestrator (removing non-root dependencies).
2. **Setup Turborepo:**
   - Install `turbo` at the workspace root.
   - Create `turbo.json` defining the main task pipelines (`build`, `dev`, `lint`, `test`).
3. **Shared Configurations:**
   - Extract base configurations to `packages/`.
   - Create `packages/config-typescript` for base `tsconfig.json`.
   - Create `packages/config-biome` from the existing `biome.json`.

## Phase 2: App and Package Restructuring
**Goal:** Physically move the code into the organized monorepo structure.

1. **Migrate Applications:**
   - Move `astro-app/` to `apps/web/`. Update its `package.json` name to `@open-setlist/web`.
   - Move `scraper/` to `apps/scraper/`. Create a `package.json` for it named `@open-setlist/scraper`.
2. **Extract Shared Libraries:**
   - Move `src/db/` to `packages/db/`. Create a minimal `package.json` named `@open-setlist/db`.
   - Move `src/types/` to `packages/types/`. Create a minimal `package.json` named `@open-setlist/types`.
3. **Handle Standalone Scripts:**
   - Move or reorganize `bin/` scripts. Some might belong in `apps/scraper`, some in `packages/db` (like migrations), and some at the root.

## Phase 3: Wiring, Linking, and Refactoring
**Goal:** Reconnect everything so that apps consume the shared packages correctly.

1. **Workspace Links:**
   - Update `apps/web` and `apps/scraper` to depend on `"@open-setlist/db": "workspace:*"` and `"@open-setlist/types": "workspace:*"`.
2. **Update Imports:**
   - Globally refactor relative imports (e.g., `../../src/db`) to package imports (e.g., `import { ... } from '@open-setlist/db'`).
3. **Resolve Dependency Duplication:**
   - Audit dependencies using PNPM. Ensure `vitest`, `playwright`, and other shared devDependencies are hoisted properly or defined in the shared config packages.

## Phase 4: CI/CD & Testing Modernization
**Goal:** Ensure the pipeline is robust, typing works across boundaries, and caching is optimized.

1. **Update Scripts:**
   - Ensure `pnpm run dev` at the root successfully boots both the frontend and any necessary background services using Turborepo.
2. **Consolidate Testing:**
   - Ensure Vitest runs properly at the monorepo level (`turbo run test`).
   - Re-verify E2E tests in `apps/web` (or where `tests/e2e` lands) using Playwright.
3. **Clean Up:**
   - Remove legacy root configuration files that are no longer needed.
   - Update `README.md` to reflect the new architecture and developer commands.
