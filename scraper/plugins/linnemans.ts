import { Page } from "playwright";
import { ScraperPlugin, ScraperResult, ScraperShow } from "../core/types";

/**
 * Linneman's Riverwest Inn Scraper
 * 
 * Target Structure (April 2026):
 * - The Events Calendar (WordPress plugin)
 * - Container: article
 * - Artist Name: heading level 3 (h3) a
 * - Date: time (text like "April 1 @ 8:00 pm - 10:30 pm")
 * - Ticket URL: Typically the event detail page.
 */
export const linnemansScraper: ScraperPlugin = async (
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
    const articles = await page.$$("article");

    for (const article of articles) {
      try {
        const titleText = await article.$eval("h3", (el) => el.textContent?.trim() || "");
        const detail_url = await article.$eval("h3 a", (el) => (el as HTMLAnchorElement).href).catch(() => null);
        
        // Date parsing: "April 1 @ 8:00 pm - 10:30 pm"
        const dateText = await article.$eval("time", (el) => el.textContent?.trim()).catch(() => "");
        
        if (!titleText || !dateText) continue;

        // Extract "April 1" from "April 1 @ 8:00 pm"
        const datePart = dateText.split('@')[0].trim();
        const event_date = new Date(`${datePart}, 2026`).toISOString().split('T')[0];

        // Extract "8:00 pm"
        const timeMatch = dateText.match(/(\d+:\d+\s*[ap]m)/i);
        const event_time = timeMatch ? timeMatch[1] : "";

        const show: any = {
          artist_name: titleText,
          event_date,
          event_time,
          ticket_url: detail_url,
          is_sold_out: false,
          is_canceled: titleText.toUpperCase().includes("CANCELED"),
          age_restriction: null,
          detail_url: null,
          enrichment_status: 'none',
        };

        result.shows.push(show);
      } catch (err: any) {
        result.errors.push({ error_type: "PARSE_FAILURE", message: err.message });
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
