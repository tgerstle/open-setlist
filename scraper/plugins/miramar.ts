import { Page } from "playwright";
import { ScraperPlugin, ScraperResult, ScraperShow } from "../core/types";

/**
 * Miramar Theatre Scraper
 * 
 * Target Structure (April 2026):
 * - MEC (Modern Events Calendar) WordPress plugin.
 * - Container: article
 * - Artist Name: heading level 3 (h3) a
 * - Date: text like "02 Apr" (needs current month/year context)
 * - Time: text like "9:30pm - 1:00am"
 * - Ticket URL: Typically the event detail page.
 */
export const miramarScraper: ScraperPlugin = async (
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
    const articles = await page.$$("article:has(h3)");

    for (const article of articles) {
      try {
        const titleText = await article.$eval("h3", (el) => el.textContent?.trim() || "");
        if (titleText.includes("Expired")) continue;

        const detail_url = await article.$eval("h3 a", (el) => (el as HTMLAnchorElement).href).catch(() => null);

        // Date parsing: "02 Apr"
        const dateText = await article.$eval("span:text-matches('^\\\\d{2} [A-Z][a-z]{2}$') i + generic, generic:text-matches('^\\\\d{2} [A-Z][a-z]{2}$')").catch(() => null);
        // Fallback for MEC layout
        const dayMonth = await article.evaluate(el => {
          const spans = Array.from(el.querySelectorAll('span'));
          const targetSpan = spans.find(s => s.textContent?.includes(''));
          return targetSpan?.nextElementSibling?.textContent?.trim() || "";
        });

        if (!titleText || !dayMonth) continue;

        const [day, monthName] = dayMonth.split(' ');
        const monthMap: Record<string, string> = {
          Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
          Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12"
        };
        const monthNum = monthMap[monthName];
        const currentYear = new Date().getFullYear();
        const event_date = `${currentYear}-${monthNum}-${day.padStart(2, '0')}`;

        const timeText = await article.evaluate(el => el.innerText.match(/\d+:\d+[ap]m/i)?.[0] || "");

        const show: any = {
          artist_name: titleText,
          event_date,
          event_time: timeText,
          ticket_url: detail_url,
          is_sold_out: (await article.innerText()).toUpperCase().includes("SOLD OUT"),
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
