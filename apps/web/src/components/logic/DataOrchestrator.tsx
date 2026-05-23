import { useStore } from "@nanostores/react";
import type { Show, Venue } from "@open-setlist/types";
import { useEffect } from "react";
import {
	activeViewStore,
	availableMonthsStore,
	eventsStore,
	loadedMonthsStore,
	venuesStore,
} from "../../stores/appState";
import { loadMonth } from "../../stores/dataActions";

export function DataOrchestrator({
	initialShows,
	initialVenues,
	initialView = "feed",
}: {
	initialShows: Show[];
	initialVenues: Venue[];
	initialView?: "feed" | "month" | "map";
}) {
	const _activeView = useStore(activeViewStore);
	const rawShows = useStore(eventsStore);

	// Initialize store with SSR data
	useEffect(() => {
		if (initialView && activeViewStore.get() !== initialView) {
			activeViewStore.set(initialView);
		}

		if (rawShows.length === 0 && initialShows) {
			// Get browser's actual today date
			const clientToday = new Date().toISOString().split("T")[0];
			const clientMonth = clientToday.substring(0, 7);

			// Filter out any stale shows baked into SSG payload
			const validInitialShows = initialShows.filter(
				(show) => (show.date || show.event_date || "") >= clientToday,
			);

			eventsStore.set(validInitialShows);
			venuesStore.set(initialVenues);

			let distinct: string[] = [];
			if (validInitialShows.length > 0) {
				// Collect all distinct months from the valid shows
				distinct = Array.from(
					new Set(
						validInitialShows
							.map((s) => (s.date || s.event_date || "").substring(0, 7))
							.filter(Boolean),
					),
				);

				// Remove clientMonth from the initially marked loaded months. The SSG payload
				// typically only includes events from today onwards, so this month is incomplete.
				// We will formally fetch its full month JSON next to backfill past days.
				const fullyLoadedMonths = distinct.filter((m) => m !== clientMonth);
				loadedMonthsStore.set(fullyLoadedMonths.sort());
			}

			// Always eagerly fetch the clientMonth full JSON to fill in any missing past days
			// for the current month that were stripped from the SSG payload.
			setTimeout(() => loadMonth(clientMonth), 100);
		}
	}, [initialShows, initialVenues, rawShows.length, initialView]);

	// Fetch manifest
	useEffect(() => {
		const fetchManifest = async () => {
			try {
				const res = await fetch("/data/events/manifest.json");
				const manifest = await res.json();
				availableMonthsStore.set(manifest.availableMonths || []);
			} catch (err) {
				console.error("Failed to load manifest", err);
			}
		};
		fetchManifest();
	}, []);

	return null; // Headless component
}
