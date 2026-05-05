import ical from "node-ical";
import { Page } from "playwright";
import { ScraperPlugin, ScraperResult, ScraperShow } from "../core/types";

/**
 * Bremen Cafe Scraper (ICS Version)
 *
 * This version fetches the public Google Calendar ICS feed directly,
 * bypassing the need to scrape the iframe DOM which often hides events
 * behind "more" buttons or "Agenda" views.
 */
export const bremenScraper: ScraperPlugin = async (
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

  const ICS_URL =
    "https://calendar.google.com/calendar/ical/cafe.bremen%40gmail.com/public/basic.ics";

  try {
    console.log("[Bremen] Fetching ICS feed via node-ical...");
    const webEvents = await ical.fromURL(ICS_URL);

    const skipKeywords = [
      "Trivia",
      "Bingo",
      "Bazaar",
      "Comedy",
      "Karaoke",
      "Poetry",
      "Open Mic",
      "Closed",
      "Holiday",
    ];

    for (const k in webEvents) {
      if (Object.prototype.hasOwnProperty.call(webEvents, k)) {
        const ev = webEvents[k];
        if (ev.type === "VEVENT") {
          const summary = ev.summary || "";
          const start = ev.start as Date;

          // Skip if no summary or start date
          if (!summary || !start || isNaN(start.getTime())) continue;

          // Skip non-music events based on summary
          if (
            skipKeywords.some((kw) =>
              summary.toLowerCase().includes(kw.toLowerCase()),
            )
          ) {
            continue;
          }

          // Format Date: YYYY-MM-DD
          const year = start.getFullYear();
          const month = String(start.getMonth() + 1).padStart(2, "0");
          const day = String(start.getDate()).padStart(2, "0");
          const event_date = year + "-" + month + "-" + day;

          // Format Time: 8:00 PM
          const event_time = start.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });

          // Artist is the summary
          const artist_name = summary.trim();

          const show: ScraperShow = {
            venue_id,
            artist_name,
            event_date,
            event_time,
            event_url: "https://bremencafe.com/calendar/", // Reference URL
          detail_url: null,
          enrichment_status: 'none',
          };

          result.shows.push(show);
        }
      }
    }

    console.log("[Bremen] Found " + result.shows.length + " shows via ICS.");
    
    // Sort by date for cleaner logs/output
    result.shows.sort((a, b) => a.event_date.localeCompare(b.event_date));

  } catch (err: any) {
    console.error("[Bremen] ICS Scraping error: " + err.message);
    result.status = "error";
    result.errors.push(err.message);
  }

  return result;
};
