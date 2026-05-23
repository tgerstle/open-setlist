import type { Page } from "playwright";

export interface ScraperShow {
	artist_name: string;
	event_date: string; // YYYY-MM-DD
	event_time: string | null;
	ticket_url: string | null;
	is_sold_out: boolean;
	age_restriction: string | null;

	// New Additions:
	detail_url?: string | null;
	doors_time?: string | null;
	price?: string | null;
	description?: string | null;
	image_url?: string | null;
	enrichment_status?: "none" | "pending" | "completed" | "failed";
}

export interface ScraperResult {
	venue_id: string;
	shows: ScraperShow[];
	timestamp: string;
	status: "success" | "partial_success" | "failed";
	errors: Array<{
		artist_name?: string;
		error_type: string;
		message: string;
		raw_value?: any;
		selector_context?: string;
	}>;
}

export type ScraperPlugin = (
	page: Page,
	venue_id: string,
) => Promise<ScraperResult>;
