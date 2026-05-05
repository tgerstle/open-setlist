import { Page } from "playwright";
import { ScraperPlugin, ScraperResult, ScraperShow } from "../core/types";

/**
 * The Cooperage Scraper
 * 
 * Target Structure (April 2026):
 * - Container: a.summary-title-link (SquareSpace layout)
 * - Artist Name: text content of the link
 * - URL: href of the link
 * - Date/Time: Inside the parent item, div.summary-metadata-item--date
 */
export const cooperageScraper: ScraperPlugin = async (
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
    // Squarespace uses either summary-item (grids) or eventlist-event (list page)
    const items = await page.$$("div.summary-item, article.eventlist-event");

    for (const item of items) {
      try {
        let artist_name = "";
        let href = "";
        let dateString = "";
        let timeText = "";

        // Check if it's a summary-item
        const isSummary = await item.evaluate((el) => el.classList.contains('summary-item'));

        if (isSummary) {
          const linkEl = await item.$("a.summary-title-link");
          if (!linkEl) continue;
          artist_name = await linkEl.innerText();
          href = (await linkEl.getAttribute("href")) || "";

          const dateEl = await item.$("time.summary-metadata-item--date");
          if (dateEl) {
            dateString = (await dateEl.getAttribute("datetime")) || "";
            timeText = await dateEl.innerText();
          }
        } else {
          // It's an eventlist-event
          const titleEl = await item.$(".eventlist-title");
          if (!titleEl) continue;
          artist_name = await titleEl.innerText();

          const linkEl = await item.$(".eventlist-title a");
          if (linkEl) {
            href = (await linkEl.getAttribute("href")) || "";
          }

          const dateEl = await item.$("time.event-date");
          if (dateEl) {
            dateString = (await dateEl.getAttribute("datetime")) || "";
            timeText = await dateEl.innerText();
          }
        }

        if (!artist_name || !dateString) continue;

        const ticket_url = href ? `https://www.cooperagemke.com${href}` : null;

        // Squarespace usually uses the href to navigate to the deep event page 
        // that contains more details.
        const detail_url = ticket_url;

        const show: any = {
          artist_name: artist_name.trim(),
          event_date: dateString,
          event_time: timeText.trim(),
          ticket_url,
          is_sold_out: false,
          is_canceled: false,
          age_restriction: null, // Hard to reliably extract from summary grid without visiting each page
          detail_url,
          enrichment_status: detail_url ? 'pending' : 'none'
        };

        // Minor edge case matching
        if (show.artist_name.toLowerCase().includes("21+")) {
          show.age_restriction = "21+";
        }

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
