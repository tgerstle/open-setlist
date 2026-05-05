import { Page } from "playwright";
import { DetailScraperPlugin } from "./types";

export const cactusDetailExtractor: DetailScraperPlugin = async (page, show) => {
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
        const metaValues = await page.$$eval('.info-block, .event-info, .event-details, .meta, .date, p, span, div', elements => {
            let doors = null;
            let event = null;
            let age_restriction = null;

            for (const el of elements) {
                const text = el.textContent?.trim() || '';
                const uText = text.toUpperCase();

                if (text.length > 50) continue;

                if (uText.includes("DOORS:")) {
                    doors = text;
                }
                if (uText.includes("SHOW:")) {
                    event = text;
                }
                if (uText.includes("21+") || uText.includes("ALL AGES")) {
                    age_restriction = text;
                }
            }
            return { doors, event, age_restriction };
        });

        // Try to get price
        const priceValue = await page.$$eval('*', (elements) => {
            const priceEls = elements.filter(el => {
                const text = el.textContent?.trim() || '';
                return text.includes('$') && /\$\d+\.?\d*/.test(text) && text.length < 25;
            });
            if (priceEls.length > 0) return priceEls[0].textContent?.trim();
            return null;
        });

        // Description
        const descriptionValue = await page.evaluate(() => {
            // First check standard common selectors
            const descContainer = document.querySelector('.event-description-body, .detail-description, .description-content, .event-description');
            if (descContainer) {
                return descContainer.textContent?.trim();
            }

            // Fallback: collect main text
            const paragraphs = Array.from(document.querySelectorAll('p'));
            const combined = paragraphs.map(p => p.textContent?.trim()).filter(Boolean).join('\n\n');
            if (combined.length > 50) return combined;

            return null;
        });

        if (metaValues.doors) {
            result.doors_time = metaValues.doors.replace(/DOORS:/i, '').trim();
        }

        if (metaValues.event) {
            result.event_time = metaValues.event.replace(/SHOW:/i, '').trim();
        }

        if (metaValues.age_restriction) {
            result.age_restriction = metaValues.age_restriction;
        }

        if (priceValue) {
            result.price = priceValue;
        }

        if (descriptionValue) {
            result.description = descriptionValue;
        }

    } catch (e: any) {
        console.error(`Cactus Club Plugin Error for ${show.detail_url}:`, e.message);
    }

    return result;
};
