import { computed, atom } from "nanostores";
import {
  eventsStore,
  searchQueryStore,
  selectedVenueStore,
  dateRangeStore,
  earliestVisibleDateStore,
} from "./appState";
import type { Show } from "../types/models";

// Create a debounced query store
export const debouncedSearchQueryStore = atom<string>("");

// Sync search query to debounced store
let _searchTimeout: ReturnType<typeof setTimeout>;
searchQueryStore.subscribe((val) => {
  clearTimeout(_searchTimeout);
  _searchTimeout = setTimeout(() => {
    debouncedSearchQueryStore.set(val);
  }, 300); // 300ms debounce
});

// Use debounced store for filtering
export const filteredShowsStore = computed(
  [eventsStore, debouncedSearchQueryStore, selectedVenueStore, dateRangeStore, earliestVisibleDateStore],
  (events, search, venue, dateRange, earliestVisibleDate) => {
    let filtered = [...events];

    // Apply baseline future-only filter unless user deliberately overrides
    // Disable future-only filter if the user is actively searching
    if (!dateRange?.from && !search) {
      filtered = filtered.filter((show) => {
        const evDate = show.event_date || show.date;
        return evDate && evDate >= earliestVisibleDate;
      });
    }

    if (search) {
      const query = search.toLowerCase();
      filtered = filtered.filter(
        (show) => {
          const artistName = show.artist_name || show.artist || '';
          const venueName = show.venue_name || '';
          return artistName.toLowerCase().includes(query) ||
            venueName.toLowerCase().includes(query);
        }
      );
    }

    if (venue) {
      filtered = filtered.filter((show) => show.venue_id === venue);
    }

    if (dateRange && dateRange.from) {
      // Keep this simple for now
      filtered = filtered.filter((show) => {
        const evDate = show.event_date || show.date;
        return evDate && evDate >= dateRange.from!;
      });
      if (dateRange.to) {
        filtered = filtered.filter((show) => {
          const evDate = show.event_date || show.date;
          return evDate && evDate <= dateRange.to!;
        });
      }
    }

    return filtered;
  },
);
