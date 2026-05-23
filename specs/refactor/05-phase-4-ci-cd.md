# Phase 4: CI/CD & Testing Modernization

## Current State Analysis
Testing is heavily fragmented. `playwright` is defined in the root context but seems to test the Astro app. `vitest` exists in both root and `astro-app/`. Scripts in `package.json` use `cd astro-app && npm run ...` which bypasses optimized tooling.

## Goals
Standardize all commands via Turborepo so a single command correctly builds, lints, or tests the entire monorepo with aggressive caching.

## Step-by-Step Changes

### 1. Unified Scripts
Update root `package.json` scripts:
```json
"scripts": {
  "dev": "turbo run dev",
  "build": "turbo run build",
  "test": "turbo run test",
  "lint": "turbo run lint"
}
```

### 2. Testing Framework Cleanup
- **Unit Tests (Vitest)**: 
  - Ensure `apps/web/vitest.config.ts`, `apps/scraper/vitest.config.ts`, and `packages/db/vitest.config.ts` are appropriately configured (or extend a base config in `packages/config-typescript` if necessary).
  - Add `"test": "vitest run"` to the `package.json` of each app/package that contains test files.
- **E2E Tests (Playwright)**:
  - Scope e2e tests directly to the `apps/web` application if they test the frontend, or create a dedicated `apps/e2e` package tailored to full-stack integration. 
  - Provide a standalone `"test:e2e"` script inside `apps/web`.

### 3. Biome Linting Integration
- Ensure all apps and packages have a `"lint": "biome check ."` script in their `package.json`.
- Turbo will recursively execute this across the entire workspace in parallel.

### 4. Cache Optimization
- Ensure `turbo.json` appropriately flags outputs for caching, especially `dist/` or `.astro/` build directories.

## Acceptance Criteria & Tests
- [ ] `pnpm remove vitest -w` and clean up the root so that tasks are passed exclusively down to apps/packages.
- [ ] `pnpm run test` cleanly runs all vitest suites identically to the pre-refactor benchmark, but significantly faster on repeat runs (cached).
- [ ] `pnpm run lint` lints code across both apps and packages simultaneously.
- **Regression Prevention**: A complete test run via root using Turborepo succeeds: `pnpm install`, `pnpm build`, `pnpm test`, and `pnpm lint`. No regressions in output or coverage.