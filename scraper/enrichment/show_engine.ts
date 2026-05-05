import { chromium, Page } from "playwright";
import Database from "better-sqlite3";
import { getPendingShows, updateShowEnrichment, initDb } from "../../src/db/index";
import { join } from "path";
import { pabstDetailExtractor } from "./plugins/pabst";
import { cactusDetailExtractor } from "./plugins/cactus";
import { cooperageDetailExtractor } from "./plugins/cooperage";
import { DetailScraperPlugin } from "./plugins/types";

// A registry of detail-page scrapers. 
// For now, this is empty or has a generic fallback, to simply mark as completed via DOM logic.
export const detailExtractors: Record<string, DetailScraperPlugin> = {
    "the-pabst-theater": pabstDetailExtractor,
    "cactus-club": cactusDetailExtractor,
    "the-cooperage": cooperageDetailExtractor
};

export const runShowEnrichmentPass = async (db: Database.Database) => {
    const pendingShows = getPendingShows(db);
    if (!pendingShows.length) {
        console.log("✅ No shows pending detail enrichment.");
        return;
    }

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log(`Starting Pass 2 Enrichment on ${pendingShows.length} shows...`);

    for (const show of pendingShows) {
        try {
            const extractor = detailExtractors[show.venue_id];

            // If we don't have a detail extractor yet, we can skip or mark as completed so we don't infinitely retry
            if (!extractor) {
                console.log(`[Skipping] No detail extractor for ${show.venue_id}, marking as completed.`);
                updateShowEnrichment(db, show.id, { enrichment_status: 'completed' });
                continue;
            }

            console.log(`[Enriching] ${show.artist_name} @ ${show.venue_id}`);

            // Navigate to deep URL
            if (!show.detail_url) {
                updateShowEnrichment(db, show.id, { enrichment_status: 'completed' });
                continue;
            }

            await page.goto(show.detail_url, { waitUntil: "domcontentloaded" });

            // Execute the venue-specific parsing logic
            const richData = await extractor(page, show);

            // Save Data to db
            updateShowEnrichment(db, show.id, {
                ...richData,
                enrichment_status: 'completed'
            });

        } catch (e: any) {
            console.error(`Failed to enrich ${show.id}:`, e.message);
            updateShowEnrichment(db, show.id, { enrichment_status: 'failed' });
        }

        // *CRUCIAL*: Anti-Bot Delay Jitter
        // Pause for 2000 - 5000 ms randomly between hits.
        const pause = Math.floor(Math.random() * 3000) + 2000;
        await new Promise(r => setTimeout(r, pause));
    }

    await browser.close();
    console.log("🎉 Pass 2 Enrichment complete.");
};

// Auto-run logic
const isMainModule =
    typeof require !== "undefined" && require.main === module ||
    (process.argv[1] === import.meta.filename || process.argv[1].endsWith("show_engine.ts"));

if (isMainModule) {
    const dbPath = join(process.cwd(), "data", "localmusic.db");
    const db = initDb(dbPath);
    runShowEnrichmentPass(db).catch(console.error);
}
