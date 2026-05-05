import { DetailScraperPlugin } from "./types";

export const cooperageDetailExtractor: DetailScraperPlugin = async (page, show) => {
    const result: {
        description?: string;
        price?: string;
        doors_time?: string;
        event_time?: string;
        age_restriction?: string;
    } = {};

    try {
        // 1. Scrape Description (Squarespace typical containers)
        result.description = await page.evaluate(() => {
            const descContainer = document.querySelector('.eventitem-description, .sqs-block-html, article');
            return descContainer ? descContainer.textContent?.trim() : undefined;
        });

        // 2. Scrape Price, Doors, Show Time, Age
        // We evaluate text nodes looking for common Cooperage phrases like "$15 ADV", "21+", "Doors 7P"
        const metaScrape = await page.$$eval('*', elements => {
            let doors, event, age, price;

            for (const el of elements) {
                const text = el.textContent?.trim().toUpperCase() || '';
                if (text.length > 50) continue; // Skip long paragraphs to avoid false positives

                if (text.includes("DOORS:")) doors = text;
                // Sometimes they use "SHOW:". Add other variations if needed later.
                if (text.includes("SHOW:")) event = text;
                if (text.includes("21+") || text.includes("ALL AGES")) age = text;
                if (text.includes("$") && /\$\d+/.test(text)) price = text;
            }
            return { doors, event, age, price };
        });

        // 3. Clean up the extracted strings
        if (metaScrape.doors) result.doors_time = metaScrape.doors.replace(/DOORS:/i, '').trim();
        if (metaScrape.event) result.event_time = metaScrape.event.replace(/SHOW:/i, '').trim();
        if (metaScrape.age) result.age_restriction = metaScrape.age;
        if (metaScrape.price) result.price = metaScrape.price;

    } catch (e: any) {
        console.error(`Cooperage Detail Error [${show.detail_url}]:`, e.message);
    }

    return result;
};