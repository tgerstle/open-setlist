import { Page } from "playwright";
import { DetailScraperPlugin } from "./types";

export const pabstDetailExtractor: DetailScraperPlugin = async (page, show) => {
    const result: {
        description?: string;
        price?: string;
        doors_time?: string;
        event_time?: string;
        age_restriction?: string;
    } = {};

    try {
        // Detailed extraction logic

        // Find basic meta items by inspecting all small text nodes:
        const metaValues = await page.$$eval('.info-block, .event-info, .event-details, li, div', elements => {
            let doors = null;
            let event = null;
            let price = null;
            let ages = null;

            for (const el of elements) {
                const rawText = el.textContent || '';
                const text = rawText.toUpperCase().trim();
                const trimmed = rawText.trim();

                // Very long blocks shouldn't be matched for these small info fields
                if (trimmed.length > 60) continue;

                if (text.includes("DOORS OPEN") && !doors) {
                    doors = trimmed;
                }
                if (text.includes("EVENT STARTS") && !event) {
                    event = trimmed;
                }
                if (text.includes("ALL AGES") || text.includes("21+")) {
                    if (text.includes("ALL AGES")) ages = "All Ages";
                    if (text.includes("21+")) ages = "21+";
                }
            }
            return { doors, event, price, ages };
        });

        // Price often lives in a structured span
        const priceValue = await page.$$eval('*', (elements) => {
            const priceEls = elements.filter(el => {
                const text = el.textContent?.trim() || '';
                return text.includes('$') && /\$\d+\.?\d*/.test(text) && text.length < 25;
            });
            if (priceEls.length > 0) return priceEls[0].textContent?.trim();
            return null;
        });

        // Description is usually in a specific container, often .event-description-body or .detail-description
        const descriptionValue = await page.evaluate(() => {
            const descContainer = document.querySelector('.event-description-body, .detail-description, .description-content, .event-info');
            if (descContainer) {
                return descContainer.textContent?.trim();
            }

            // Fallback: collect paragraphs
            const paragraphs = Array.from(document.querySelectorAll('p'));
            const combined = paragraphs.map(p => p.textContent?.trim()).filter(Boolean).join('\n\n');
            if (combined.length > 50) return combined;

            return null;
        });

        if (metaValues.doors) result.doors_time = metaValues.doors.replace(/DOORS OPEN/i, '').trim() || metaValues.doors;
        if (metaValues.event) result.event_time = metaValues.event.replace(/EVENT STARTS/i, '').trim() || metaValues.event;
        if (metaValues.ages) result.age_restriction = metaValues.ages;
        if (priceValue) result.price = priceValue;
        if (descriptionValue) result.description = descriptionValue;

    } catch (e: any) {
        console.error(`Pabst Plugin Error for ${show.detail_url}:`, e.message);
    }

    return result;
};
