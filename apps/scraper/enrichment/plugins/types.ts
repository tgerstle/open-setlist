import type { Show } from "@open-setlist/types";
import type { Page } from "playwright";

export type DetailScraperPlugin = (
	page: Page,
	show: Show,
) => Promise<{
	description?: string;
	price?: string;
	doors_time?: string;
	event_time?: string;
	age_restriction?: string;
}>;
