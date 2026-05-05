# Phase 1: Deep Clean & Sanitization

## Goals
Remove all private data, local logs, and original git history to prep for an open-source release.

## Code/Files to Edit or Delete
1. **Initialize Git:**
   - Execute in root: `rm -rf .git && git init && git commit --allow-empty -m "Initial open source commit"`
2. **Clear Data & Logs:**
   - Delete localized test scripts: `scraper/scripts/test-cooperage.ts`, `scraper/scripts/test-cooperage2.ts`, `scraper/scripts/test-scraper.ts`.
   - Remove `data/enrichment_staging/*` and `logs/*`.
   - Remove `data/*.db` and `data/*.db-journal`.
   - Add `.gitkeep` to `data/` and `logs/` to preserve their structure in the repo.
3. **Remove Specific IP & Docs:**
   - Search the workspace for any loose markdown files referencing venue names or strategies (e.g., `docs/research_cactus.ts` equivalent).

## Tests/Validation to Run
- Review `ls -la data/` to ensure no active `mkesetlist.db` files are present.
- Expect local build errors if running `npm run build` because the DB does not exist yet. However, this is expected in Phase 1 before running initialization scripts.