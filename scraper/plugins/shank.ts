import { Page } from "playwright";
import { ScraperPlugin, ScraperResult, ScraperShow } from "../core/types";

/**
 * Shank Hall Scraper (Tickets Page Version)
 * 
 * Target Structure:
 * - Simple list of shows.
 * - Container: generic div within the "Upcoming Shows" section.
 * - Artist Name: strong tag inside the link.
 * - Date: text in a sibling div (e.g. "Apr 3 Fri").
 * - Ticket URL: the link itself.
 */
export const shankScraper: ScraperPlugin = async (
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
    // Navigate to the tickets page specifically as it's more stable
    await page.goto("https://shankhall.com/tickets/", { waitUntil: "networkidle" });
    await page.waitForSelector("h2:has-text('Upcoming Shows')");

    const showEntries = await page.$$("div:has(> div:has-text('Get Tickets'))");

    for (const entry of showEntries) {
      try {
        const artist_name = await entry.$eval("strong", (el) => el.textContent?.trim() || "");
        const ticket_url = await entry.$eval("a", (el) => (el as HTMLAnchorElement).href).catch(() => null);
        
        // Date parsing: "Apr 3 Fri"
        const dateText = await entry.evaluate(el => {
            const dateEl = el.previousElementSibling;
            return dateEl?.textContent?.trim() || "";
        });

        if (!dateText || !artist_name) continue;

        const [monthName, day, dow] = dateText.split(/\s+/);
        const monthMap: Record<string, string> = {
          Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
          Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12"
        };
        const monthNum = monthMap[monthName];
        const currentYear = new Date().getFullYear();
        const event_date = `${currentYear}-${monthNum}-${day.padStart(2, '0')}`;

        const timeText = await entry.$eval("div:has-text('pm'), div:has-text('am')", (el) => el.textContent?.trim()).catch(() => "");

        const show: any = {
          artist_name,
          event_date,
          event_time: timeText,
          ticket_url,
          is_sold_out: false,
          is_canceled: false, // Tickets page usually only shows active shows
          age_restriction: "21+",
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
