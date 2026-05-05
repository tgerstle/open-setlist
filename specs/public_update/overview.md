# Local Live Music Tracker: Generalization Overview

## Objective
Generalize the private, locally-targeted web application (formerly "MKE Setlist") into a public, open-source boilerplate ("Local Live Music Tracker") that anyone can clone, run, and customize for their own city.

## Architecture
- Astro
- React
- Tailwind v4
- SQLite
- Playwright
- Nanostores
- TSX / TypeScript

## Execution Plan
The transformation will be executed in five distinct phases. Clean, presentable, typesafe code is a priority. After each phase, a status check will be performed to ensure the project still builds.

- **[Phase 1: Deep Clean & Sanitization](./phase-1.md)** - Removing git history, data, logs, and specific IP/docs.
- **[Phase 2: Scraper Generalization](./phase-2.md)** - Removing venue-specific scrapers and creating a generic template.
- **[Phase 3: Branding & Configuration Scrubbing](./phase-3.md)** - Generalizing package details, UI, SEO, database structure, and tailwind configurations.
- **[Phase 4: Mock Data & Onboarding](./phase-4.md)** - Verifying mock data generation script so it behaves cleanly with the new generalized structure.
- **[Phase 5: Documentation & Open Source Release](./phase-5.md)** - Drafting a brand new README.md with clear developer startup procedures.