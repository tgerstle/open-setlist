import type { Show, Venue } from "@open-setlist/types";

/**
 * Groups shows by their date for the DailyFeedView.
 * Returns the unique dates, the count of shows per date, and the flat array of sorted shows.
 */
export function groupByDate(shows: Show[]) {
	const sorted = [...shows].sort((a, b) => {
		const dateA = new Date(a.date || a.event_date || "").getTime();
		const dateB = new Date(b.date || b.event_date || "").getTime();
		return (dateA || 0) - (dateB || 0);
	});

	const groups: string[] = [];
	const groupCounts: number[] = [];
	const groupedShows: Show[] = [];
	let currentGroupDate = "";
	let currentCount = 0;

	sorted.forEach((show) => {
		let showDate = show.date || show.event_date;
		if (!showDate) showDate = "Unknown Date";

		if (showDate !== currentGroupDate) {
			if (currentGroupDate !== "") {
				groupCounts.push(currentCount);
			}
			currentGroupDate = showDate;
			groups.push(showDate);
			currentCount = 0;
		}
		groupedShows.push(show);
		currentCount++;
	});

	if (currentCount > 0 && currentGroupDate !== "") {
		groupCounts.push(currentCount);
	}

	return { groups, groupCounts, groupedShows };
}

export interface VenueData {
	venue: Venue;
	shows: Show[];
}

/**
 * Aggregates shows by venue for markers on the map.
 */
export function aggregateShowsByVenue(shows: Show[], venues: Venue[]) {
	const data: Record<string, VenueData> = {};

	// Initialize venues that have coordinates
	venues.forEach((v) => {
		if (v.coordinates) {
			data[v.id] = { venue: v, shows: [] };
		}
	});

	// Distribute the filtered shows to their respective venues
	shows.forEach((show) => {
		if (data[show.venue_id]) {
			data[show.venue_id].shows.push(show);
		}
	});

	return Object.values(data).filter((d) => d.shows.length > 0);
}
