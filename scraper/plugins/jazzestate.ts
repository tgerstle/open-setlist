import { Page } from "playwright";
import { ScraperPlugin, ScraperResult, ScraperShow } from "../core/types";

/**
 * Jazz Estate Scraper
 *
 * Target Structure (April 2026):
 * - Wix-based site at estatemke.com/events
 * - Dates are in H2 (e.g., "THU APRIL 23")
 * - Artist names are in H3, P, or SPAN near the H2
 * - Ticket links are a[href*="tix.com"]
 */
export const jazzEstateScraper: ScraperPlugin = async (
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
    await page.goto("https://www.estatemke.com/events", {
      waitUntil: "domcontentloaded",
      timeout: 45000,
    });
    // Give Wix time to hydrate
    await page.waitForTimeout(5000);

    const events = await page.evaluate(() => {
      const found = [];
      const h2s = Array.from(document.querySelectorAll("h2"));
      
      for (const h2 of h2s) {
        const dateText = h2.textContent?.trim() || "";
        // Match "THU APRIL 23" or similar
        if (!dateText.match(/^[A-Z]{3,4} [A-Z]+ \d+$/)) continue;

        let artist = "";
        let ticketUrl = "";
        
        // Traverse up to find the common container for this event
        let container = h2.parentElement;
        for (let i = 0; i < 5; i++) {
          if (!container) break;
          
          // Look for ticket link
          const tix = container.querySelector('a[href*="tix.com"]');
          if (tix) ticketUrl = (tix as HTMLAnchorElement).href;

          // Look for artist name (H3, P, or Span that isn't the date or a generic label)
          if (!artist) {
            const potentialArtists = Array.from(container.querySelectorAll("h3, p, span"));
            for (const el of potentialArtists) {
              const txt = el.textContent?.trim() || "";
              if (
                txt.length > 3 && 
                txt !== dateText && 
                !txt.includes("TICKETS") && 
                !txt.includes("SOLD OUT") &&
                !txt.includes("WIX")
              ) {
                artist = txt;
                break;
              }
            }
          }
          if (artist && ticketUrl) break;
          container = container.parentElement;
        }

        if (artist) {
          found.push({ dateText, artist, ticketUrl });
        }
      }
      return found;
    });

    const monthMap: Record<string, string> = {
      JANUARY: "01", FEBRUARY: "02", MARCH: "03", APRIL: "04", MAY: "05", JUNE: "06",
      JULY: "07", AUGUST: "08", SEPTEMBER: "09", OCTOBER: "10", NOVEMBER: "11", DECEMBER: "12"
    };

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    for (const ev of events) {
      try {
        const parts = ev.dateText.split(" ");
        if (parts.length < 3) continue;
        
        const monthName = parts[1].toUpperCase();
        const day = parts[2].padStart(2, "0");
        const monthNum = monthMap[monthName];
        
        if (!monthNum) continue;

        // Year rolling logic
        let year = currentYear;
        if (parseInt(monthNum) < currentMonth - 2) {
          year++;
        }

        const event_date = year + "-" + monthNum + "-" + day;

        result.shows.push({
          venue_id,
          artist_name: ev.artist.split("\n")[0].trim(), // Take first line if multiline
          event_date,
          event_time: "7:00 PM", // Default for Jazz Estate unless parsed (they often have 7 & 9:30)
          event_url: "https://www.estatemke.com/events",
          ticket_url: ev.ticketUrl || undefined,
        });
      } catch (err: any) {
        result.errors.push("Failed to parse event: " + ev.dateText + " - " + err.message);
      }
    }

    console.log("[Jazz Estate] Found " + result.shows.length + " shows.");

  } catch (err: any) {
    console.error("[Jazz Estate] Scraping error: " + err.message);
    result.status = "error";
    result.errors.push(err.message);
  }

  return result;
};
