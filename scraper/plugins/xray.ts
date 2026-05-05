import { Page } from "playwright";
import { ScraperPlugin, ScraperResult, ScraperShow } from "../core/types";

/**
 * X-Ray Arcade Scraper
 * 
 * Target Structure (April 2026):
 * - Container: article
 * - Artist Name: h1 a
 * - Date: time (text contains full date like "Wednesday, April 1, 2026")
 * - Time: time (text contains "6:30 PM")
 * - Ticket URL: Typically the event page itself or external link in "View Event"
 * - Location Detection: X-Ray often hosts shows at other venues (Anodyne, Falcon Hall).
 *   We should filter for shows actually at X-Ray or handle the location.
 */
export const xrayScraper: ScraperPlugin = async (
  page: Page,
  venue_id: string,
): Promise<ScraperResult> => {
  const result: ScraperResult = {
    venue_id,
    shows: [],
    timestamp: new Date().toISOString(),
    status: "success",
    errors: [],
  };

  try {
    const articles = await page.$$('article');

    for (const article of articles) {
      try {
        const titleText = await article.$eval("h1", (el) => el.textContent?.trim() || "");
        
        // Skip if not at X-Ray (they listing offsite shows like @ ANODYNE)
        if (titleText.includes("@")) {
          continue;
        }

        const dateText = await article.$eval("time", (el) => el.textContent?.trim()).catch(() => null);
        const event_time = await article.$eval("time:has-text('PM'), time:has-text('AM')", (el) => el.textContent?.trim()).catch(() => "");
        
        const event_url = await article.$eval("a", (el) => (el as HTMLAnchorElement).href).catch(() => null);

        if (!titleText || !dateText) continue;

        // Date Parsing: "Wednesday, April 1, 2026" -> "2026-04-01"
        const date = new Date(dateText);
        if (isNaN(date.getTime())) {
          throw new Error(`Invalid date format: ${dateText}`);
        }
        const event_date = date.toISOString().split('T')[0];

        const show: any = {
          artist_name: titleText,
          event_date,
          event_time,
          ticket_url: event_url, // X-Ray uses event page as ticket portal
          is_sold_out: false,
          is_canceled: titleText.toUpperCase().includes("CANCELED"),
          age_restriction: null,
          detail_url: null,
          enrichment_status: 'none',
        };

        result.shows.push(show);
      } catch (err: any) {
        result.errors.push({
          error_type: "PARSE_FAILURE",
          message: err.message,
        });
      }
    }
  } catch (err: any) {
    result.status = "failed";
    result.errors.push({
      error_type: "SCRAPE_CRASH",
      message: err.message,
    });
  }

  return result;
};
