import { ScraperPlugin, ScraperResult } from "./types";
import Database from "better-sqlite3";
import { insertShow, initDb } from "../../src/db/index";
import { join } from "node:path";
import { writeFileSync } from "node:fs";
import { launchStealthBrowser } from "./stealth";
import { generateFingerprint, getProxyConfig } from "./identity";
import { runStealthAudit } from "./audit";
import { exampleVenueScraper } from "../plugins/example-venue";

import { auditLogger } from "../../src/utils/audit-logger";

export const runScraper = async (
  venue_id: string,
  url: string,
  plugin: ScraperPlugin,
  db: Database.Database,
) => {
  auditLogger.log(`Starting scrape for ${venue_id}`, "INFO", { url });

  const proxy = getProxyConfig();
  const browser = await launchStealthBrowser(true, proxy);

  // Generate randomized fingerprint for this session
  const { userAgent, viewport, deviceScaleFactor } = generateFingerprint();

  const context = await browser.newContext({
    userAgent,
    viewport,
    deviceScaleFactor,
    javaScriptEnabled: true,
  });

  const page = await context.newPage();

  try {
    // Pre-flight Audit (Phase 4)
    if (process.env.AUDIT_STEALTH === "true") {
      const audit = await runStealthAudit(page);
      if (audit.status === "FAIL") {
        auditLogger.log(
          `Stealth Pre-flight Audit FAILED for ${venue_id}`,
          "ERROR",
          { score: audit.score },
        );
        throw new Error(
          `🛑 Stealth Pre-flight Audit FAILED (Bot Score: ${audit.score}%). Halting.`,
        );
      }
      auditLogger.log(
        `Stealth Pre-flight Audit PASSED for ${venue_id}`,
        "INFO",
        { score: audit.score },
      );
    }

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });

    // Execute plugin
    const result = await plugin(page, venue_id);

    // Handle results
    if (result.status === "failed") {
      auditLogger.log(`Failed to scrape ${venue_id}`, "ERROR", {
        error: result.errors[0]?.message,
      });
      await page.screenshot({
        path: join(
          process.cwd(),
          "logs",
          "screenshots",
          `${venue_id}-fail.png`,
        ),
      });
    } else {
      auditLogger.log(`Successfully scraped ${venue_id}`, "INFO", {
        showsFound: result.shows.length,
      });

      // Upsert into DB
      for (const show of result.shows) {
        // Strip out quotes, ampersands, commas, and dots first, THEN replace whitespace with dashes to avoid multiple hyphens.
        const cleanArtist = show.artist_name
          .toLowerCase()
          .replace(/['"&,.]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .replace(/[^a-z0-9-]/g, "");
        const showId = `${venue_id}-${cleanArtist}-${show.event_date}`;

        insertShow(db, {
          id: showId,
          venue_id,
          ...show,
          last_scanned_at: new Date().toISOString(),
        });
      }

      if (result.errors.length > 0) {
        auditLogger.log(`Parsing errors encountered for ${venue_id}`, "WARN", {
          errorCount: result.errors.length,
        });
      }
    }

    // Write audit log
    const logPath = join(
      process.cwd(),
      "logs",
      `scraper-${venue_id}-${new Date().toISOString().split("T")[0]}.json`,
    );
    writeFileSync(logPath, JSON.stringify(result, null, 2));

    return result;
  } catch (err: any) {
    auditLogger.log(`Fatal error during ${venue_id} scrape`, "ERROR", {
      error: err.message,
    });
  } finally {
    await browser.close();
  }
};

// Main Execution
const isMainModule =
  process.argv[1] &&
  (process.argv[1] === import.meta.filename ||
    process.argv[1].endsWith("runner.ts"));
if (isMainModule) {
  const dbPath = join(process.cwd(), "data", "localmusic.db");
  const db = initDb(dbPath);

  const runAll = async () => {
    const venues = [
      {
        id: "example-venue",
        url: "https://example-venue.com/calendar",
        plugin: exampleVenueScraper,
      },
    ];

    const targetVenue = process.argv
      .find((arg) => arg.startsWith("--venue="))
      ?.split("=")[1];

    const venuesToRun = targetVenue
      ? venues.filter((v) => v.id === targetVenue)
      : venues;

    if (venuesToRun.length === 0) {
      auditLogger.log(`No matching venue found for ID: ${targetVenue}`, "WARN");
    }

    for (const venue of venuesToRun) {
      await runScraper(venue.id, venue.url, venue.plugin, db);
    }

    auditLogger.log("All scrapers finished.", "INFO");
    auditLogger.rotate();
    db.close();
  };

  runAll().catch(console.error);
}
