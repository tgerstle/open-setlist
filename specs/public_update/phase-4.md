# Phase 4: Mock Data & Onboarding

## Goals
Ensure the existing mock database generation script (`generate-mock-db.ts`) operates autonomously and flexibly without tying into Milwaukee bounds, producing a high-quality demonstration dataset constrainted only by generic faker rules.

## Code/Files to Edit or Delete
1. **`bin/generate-mock-db.ts` Generalization:**
   - Change the `data/demo.db` generation process to use the new `localmusic.db` target.
   - Remove hardcoded `Milwaukee, WI` address attachments to `faker.location.streetAddress()`. Use `faker.location.city() + ', ' + faker.location.state({ abbreviated: true })`.
   - Update bounding box latitudes/longitudes to reflect a generic city center range or fetch from a base demo center.
   - Change `is_mke_local` references to `is_local`.

## Tests/Validation to Run
- Run `npm run db:init` followed by `npx tsx bin/generate-mock-db.ts`. 
- Serve the application via `npm run dev` and navigate to the feed and map routes locally to ensure the demo data correctly populated the system and map renders without panicking.