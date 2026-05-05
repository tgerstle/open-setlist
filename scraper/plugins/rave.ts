import { Page } from "playwright";
import { ScraperPlugin, ScraperResult, ScraperShow } from "../core/types";

/**
 * The Rave / Eagles Club Scraper
 *
 * Target Structure (April 2026):
 * - Page: https://www.therave.com/milwaukee_concerts.asp
 * - High-level structure uses detailed 'title' attributes on links for artist/date/time info.
 * - Each show link matches "concert_details.asp?id=".
 */
export const raveScraper: ScraperPlugin = async (
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
    console.log("  [rave] Navigating to concert listing...");
    await page.goto("https://www.therave.com/milwaukee_concerts.asp", {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    
    // Wix/Legacy site stabilization
    await page.waitForTimeout(5000);

    const showsFound = await page.evaluate(() => {
      const results: any[] = [];
      const links = Array.from(document.querySelectorAll('a[href*="concert_details.asp?id="]'));
      const seenIds = new Set();

      for (const link of links) {
        const href = (link as HTMLAnchorElement).href;
        const urlMatch = href.match(/id=(\d+)/);
        const id = urlMatch ? urlMatch[1] : href;

        if (seenIds.has(id)) continue;
        seenIds.add(id);

        const title = link.getAttribute("title") || "";
        // Match format: "Luis Angel (El Flaco) at The Rave/Eagles Club This Friday, April 24, 2026 at 8pm"
        // Regex: (.*) at The Rave/Eagles Club .* ([A-Z][a-z]+ \d{1,2}, \d{4}) at (.*)
        const match = title.match(/(.*) at The Rave\/Eagles Club.* ([A-Z][a-z]+ \d{1,2}, \d{4}) at (.*)/);
        
        if (match) {
          results.push({
            artist: match[1].trim(),
            dateStr: match[2].trim(),
            time: match[3].trim(),
            url: href
          });
        }
      }
      return results;
    });

    const monthMap: Record<string, string> = {
      January: "01", February: "02", March: "03", April: "04", May: "05", June: "06",
      July: "07", August: "08", September: "09", October: "10", November: "11", December: "12"
    };

    for (const show of showsFound) {
      try {
        // Parse dateStr: "April 24, 2026"
        const dateParts = show.dateStr.replace(",", "").split(" ");
        if (dateParts.length < 3) continue;

        const month = monthMap[dateParts[0]];
        const day = dateParts[1].padStart(2, "0");
        const year = dateParts[2];

        if (!month) continue;
        const event_date = year + "-" + month + "-" + day;

        result.shows.push({
          venue_id,
          artist_name: show.artist,
          event_date,
          event_time: show.time,
          event_url: show.url,
          ticket_url: show.url
        });
      } catch (e: any) {
        result.errors.push("Failed to parse show: " + show.artist + " - " + e.message);
      }
    }

    console.log("[Rave] Found " + result.shows.length + " shows.");

  } catch (err: any) {
    console.error("[Rave] Scraping error: " + err.message);
    result.status = "error";
    result.errors.push(err.message);
  }

  return result;
};
