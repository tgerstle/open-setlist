import { Page } from "playwright";
import { Show } from "../../../src/types/index";

export type DetailScraperPlugin = (
    page: Page,
    show: Show
) => Promise<{
    description?: string;
    price?: string;
    doors_time?: string;
    event_time?: string;
    age_restriction?: string;
}>;
