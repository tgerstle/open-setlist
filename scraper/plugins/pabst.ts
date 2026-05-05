import { Page } from "playwright";
import { ScraperPlugin, ScraperResult, ScraperShow } from "../core/types";

/**
 * Pabst Theater Group Scraper (Pabst Theater, Riverside Theater, Turner Hall Ballroom, Back Room)
 *
 * Target Structure (as of March 2026):
 * - Container: .eventItem.entry (or .eventItem)
 * - Artist Name: h3.title a (Text inside the anchor within the H3)
 * - Date Container: .date
 *   - .m-date__month: e.g., "Mar."
 *   - .m-date__day: e.g., " 03"
 *   - .m-date__year: e.g., " / 2026"
 * - Ticket URL: a.tickets (looks for href containing axs.com)
 */
export const pabstScraper: ScraperPlugin = async (
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
    // 1. Find all event containers (The Grid View)
    // Updated March 2026: The site uses .eventItem as a common class, but let's be more robust
    const showCards = await page.$$(
      ".eventItem, div.event_list > div, div.item",
    );

    if (showCards.length === 0) {
      // Fallback: search for any div containing "BUY TICKETS" or "MORE INFO"
      const fallbackCards = await page.$$(
        'div:has(h3):has(a:text("BUY TICKETS"))',
      );
      if (fallbackCards.length > 0) {
        showCards.push(...fallbackCards);
      }
    }

    if (showCards.length === 0) {
      result.status = "failed";
      result.errors.push({
        error_type: "SELECTOR_MISMATCH",
        message: "No show cards found using .eventItem",
        selector_context: "div.event_list",
      });
      return result;
    }

    for (const card of showCards) {
      try {
        // Extract Artist Name
        const artist_name = await card.$eval("h3.title", (el) =>
          el.textContent?.trim(),
        );

        // Check for "CANCELED" or "SOLD OUT" status
        const statusElementsText = await card
          .$$eval(
            ".m-date__status, .status, .event-status, .promotion-text, .date, .text",
            (elements) =>
              elements
                .map((el) => el.textContent?.trim().toUpperCase())
                .join(" "),
          )
          .catch(() => "");

        const isCanceled = statusElementsText.includes("CANCELED");
        const isSoldOut = statusElementsText.includes("SOLD OUT");

        if (isCanceled) {
          // Gracefully skip canceled shows for now, or log them
          continue;
        }

        // Extract Date Parts
        const month = await card
          .$eval(".m-date__month", (el) =>
            el.textContent?.trim().replace(/\.$/, ""),
          )
          .catch(() => null);

        const day = await card
          .$eval(".m-date__day", (el) => el.textContent?.trim())
          .catch(() => null);

        const year = await card
          .$eval(".m-date__year", (el) =>
            el.textContent?.trim().replace("/", "").trim(),
          )
          .catch(() => null);

        // Ticket URL
        const ticket_url = await card
          .$eval("a.tickets", (el) => (el as HTMLAnchorElement).href)
          .catch(() => null);

        if (!artist_name || !month || !day || !year) {
          throw new Error(
            `Missing required fields: artist_name=${artist_name}, date=${month} ${day} ${year}`,
          );
        }

        // Date Parsing
        const monthMap: Record<string, string> = {
          Jan: "01",
          January: "01",
          Feb: "02",
          February: "02",
          Mar: "03",
          March: "03",
          Apr: "04",
          April: "04",
          May: "05",
          Jun: "06",
          June: "06",
          Jul: "07",
          July: "07",
          Aug: "08",
          August: "08",
          Sep: "09",
          September: "09",
          Oct: "10",
          October: "10",
          Nov: "11",
          November: "11",
          Dec: "12",
          December: "12",
        };

        const monthNum = monthMap[month];
        if (!monthNum) {
          throw new Error(`Invalid month format: ${month}`);
        }

        const formattedDay = day.padStart(2, "0");
        const event_date = `${year}-${monthNum}-${formattedDay}`;

        const detailHref = await card.$eval('a.event-image-link', el => el.getAttribute('href')).catch(() => null) || await card.$eval('h3.title a', el => el.getAttribute('href')).catch(() => null);
        const detail_url = detailHref?.startsWith('http')
          ? detailHref
          : detailHref ? `https://pabsttheatergroup.com${detailHref}` : null;

        const show: ScraperShow = {
          artist_name,
          event_date,
          event_time: "", // We might extract this from detail pages later
          ticket_url,
          is_sold_out: false,
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
          raw_value: await card
            .innerHTML()
            .catch(() => "could not read innerHTML"),
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
