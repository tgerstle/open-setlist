import { atom, map } from "nanostores";
import type { ViewType, DateRange, Show, Venue } from "../types/models";

export const activeViewStore = atom<ViewType>("feed");
export const searchQueryStore = atom<string>("");
export const selectedVenueStore = atom<string | null>(null);
export const dateRangeStore = atom<DateRange | undefined>(undefined);
export const selectedShowStore = atom<Show | null>(null);
export const topVisibleVenueStore = atom<string | null>(null);

const initialDate = typeof window !== 'undefined'
    ? new Date().toISOString().split("T")[0]
    : "1970-01-01"; // Fallback that shows everything during SSR
export const browserTodayStore = atom<string>(initialDate);

// The dynamic floor date for the timeline when no explicit from/to is provided.
// Initializes to today, but pushes backwards when user scrolls up to load older shows.
export const earliestVisibleDateStore = atom<string>(initialDate);

export const eventsStore = atom<Show[]>([]);
export const venuesStore = atom<Venue[]>([]);

// Data loading state
export const loadedMonthsStore = atom<string[]>([]);
export const availableMonthsStore = atom<string[]>([]);
export const isLoadingPastStore = atom<boolean>(false);
export const isLoadingFutureStore = atom<boolean>(false);
