import { Page } from "playwright";
import { ScraperPlugin, ScraperResult, ScraperShow } from "../core/types";

/**
 * Mad Planet Scraper
 *
 * Target Structure (April 2026):
 * - Squarespace-based events page.
 * - Container: article
 * - Artist Name: heading level 1 (h1) a
 * - Date: Text inside article figure/paragraph like "Friday, April 3rd!"
 * - Time: Usually "Doors @ 9pm"
 * - Ticket URL: Typically the event detail page or the article link.
 */
export const madPlanetScraper: ScraperPlugin = async (
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
        const artist_name = await article.$eval(
          "h1",
          (el) => el.textContent?.trim() || "",
        );
        const detail_url = await article
          .$eval(
            "a:has-text('View Event')",
            (el) => (el as HTMLAnchorElement).href,
          )
          .catch(() => null);

        // Mad Planet stores the date in a paragraph within a figure or generic div
        // e.g., "Friday, April 3rd!"
        const fullText = await article.innerText();
        const dateMatch = fullText.match(
          /(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),\s+([A-Za-z]+)\s+(\d+)(?:st|nd|rd|th)?/i,
        );

        if (!artist_name || !dateMatch) continue;

        const [_, monthName, day] = dateMatch;
        const monthMap: Record<string, string> = {
          january: "01",
          february: "02",
          march: "03",
          april: "04",
          may: "05",
          june: "06",
          july: "07",
          august: "08",
          september: "09",
          october: "10",
          november: "11",
          december: "12",
        };
        const monthNum = monthMap[monthName.toLowerCase()];
        const currentYear = new Date().getFullYear();
        const event_date = `${currentYear}-${monthNum}-${day.padStart(2, "0")}`;

        const timeMatch = fullText.match(/Doors\s+@\s+(\d+(?::\d+)?\s*[ap]m)/i);
        const event_time = timeMatch ? timeMatch[1] : "9:00 PM";

        const show: any = {
          artist_name,
          event_date,
          event_time,
          ticket_url: detail_url,
          is_sold_out: false,
          is_canceled: false,
          age_restriction: "21+",
          detail_url,
          enrichment_status: detail_url ? 'pending' : 'none',
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
