import { Page } from "playwright";
import { ScraperPlugin, ScraperResult, ScraperShow } from "../core/types";
import { humanDelay, humanScroll } from "../core/behavior";

/**
 * Cactus Club Scraper
 * 
 * Target Structure (March 2026):
 * - Container: article
 * - Artist Name: h2 a
 * - Date Container: div (containing format "Sun 03/01/26")
 * - Ticket URL: a:has-text("Buy Tickets")
 */
export const cactusScraper: ScraperPlugin = async (
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
    // Human simulation: wait and scroll
    await humanDelay(page, 1500, 3000);
    await humanScroll(page);

    const articles = await page.$$('article');

    if (articles.length === 0) {
      result.status = "failed";
      result.errors.push({
        error_type: "SELECTOR_MISMATCH",
        message: "No show articles found",
      });
      return result;
    }

    for (const article of articles) {
      try {
        // Extract Artist Name
        let artist_name = await article.$eval("h2", (el) =>
          el.textContent?.trim() || ""
        );

        let is_canceled = false;
        if (artist_name.toUpperCase().includes("CANCELED")) {
          is_canceled = true;
          artist_name = artist_name.replace(/\*?CANCELED\*?/gi, "").trim();
        }

        // Extract Date and Time
        // Format: "Sun 03/01/26" and "7:00PM"
        const dateText = await article.$eval("div:has-text('/')", (el) =>
          el.textContent?.trim()
        ).catch(() => null);

        const ticket_url = await article
          .$eval('a:has-text("Buy Tickets")', (el) => (el as HTMLAnchorElement).href)
          .catch(() => null) || await article
            .$eval('a:has-text("Event")', (el) => (el as HTMLAnchorElement).href)
            .catch(() => null);

        const priceText = await article
          .$eval('div:has-text("$"), div:has-text("Free")', (el) => el.textContent?.trim())
          .catch(() => null);

        if (!artist_name || !dateText) {
          continue; // Skip if mandatory fields are missing
        }

        // Date Parsing: "Sun 03/01/26" -> "2026-03-01"
        const dateMatch = dateText.match(/(\d{2})\/(\d{2})\/(\d{2})/);
        if (!dateMatch) {
          throw new Error(`Invalid date format: ${dateText}`);
        }

        const [_, month, day, yearShort] = dateMatch;
        const event_date = `20${yearShort}-${month}-${day}`;

        // Sold Out Detection
        const is_sold_out = !!(priceText?.toUpperCase().includes("SOLD OUT"));

        const detailHref = await article.$eval('h2 a', el => el.getAttribute('href')).catch(() => null);
        const detail_url = detailHref?.startsWith('http')
          ? detailHref
          : detailHref ? `https://cactusclubmilwaukee.com${detailHref}` : null;

        const show: any = {
          artist_name,
          event_date,
          event_time: "", // Could refine this later
          ticket_url,
          is_sold_out,
          is_canceled,
          age_restriction: null,
          detail_url,
          enrichment_status: detail_url ? 'pending' : 'none'
        };

        result.shows.push(show);
      } catch (err: any) {
        result.status = "partial_success";
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
