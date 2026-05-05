import { Page } from "playwright";
import { Show } from "../../../src/types/index";
import { DetailScraperPlugin } from "./types";

/**
 * Example Detail Enrichment Plugin
 * 
 * This explores the deep detail page of an event (if detail_url was captured during Pass 1)
 * to fetch granular data like description, pricing, and exact door times.
 */
export const exampleDetailExtractor: DetailScraperPlugin = async (page: Page, show: Show) => {
    // Example logic interacting with the DOM of the detail page:
    // const priceText = await page.locator('.ticket-price').textContent();
    // const doorsText = await page.locator('.doors-time').textContent();
    // const description = await page.locator('.event-description').textContent();

    return {
        price: "$10.00",
        doors_time: "7:00 PM",
        description: "An example enriched description fetched from the venue's detail page."
    };
};
