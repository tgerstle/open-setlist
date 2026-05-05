import { Page } from "playwright";
import { ScraperPlugin, ScraperResult, ScraperShow } from "../core/types";

/**
 * Falcon Bowl Scraper
 * 
 * Target Structure (April 2026):
 * - Squarespace-based events page.
 * - Container: article
 * - Artist Name: heading level 1 (h1) a
 * - Date: time (text like "Wednesday, April 1, 2026")
 * - Time: time (text like "7:30 PM")
 * - Ticket URL: Typically the "View Event" link.
 */
export const falconScraper: ScraperPlugin = async (
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
        const artist_name = await article.$eval("h1", (el) => el.textContent?.trim() || "");
        if (!artist_name || artist_name === "EVENTS CALENDAR") continue;

        const dateText = await article.$eval("time", (el) => el.textContent?.trim()).catch(() => "");
        const timeText = await article.$eval("li:has(time + generic + time) time", (el) => el.textContent?.trim()).catch(() => "");
        
        const detail_url = await article.$eval("a:has-text('View Event')", (el) => (el as HTMLAnchorElement).href).catch(() => null);

        if (!artist_name || !dateText) continue;

        // Date parsing: "Wednesday, April 1, 2026"
        const event_date = new Date(dateText).toISOString().split('T')[0];

        const show: any = {
          artist_name,
          event_date,
          event_time: timeText,
          ticket_url: detail_url,
          is_sold_out: (await article.innerText()).toUpperCase().includes("SOLD OUT"),
          is_canceled: artist_name.toUpperCase().includes("CANCELED"),
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
