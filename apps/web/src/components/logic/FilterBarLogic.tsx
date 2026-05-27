import React, { Suspense } from "react";
import { useStore } from "@nanostores/react";
import type { Venue } from "@open-setlist/types";
import { FilterBar } from "@open-setlist/ui/src/components/ui/FilterBar";
import {
	dateRangeStore,
	searchQueryStore,
	selectedShowStore,
	selectedVenueStore,
	topVisibleVenueStore,
} from "../../stores/appState";

interface FilterBarLogicProps {
	initialVenues: Venue[];
}

export function FilterBarLogic({ initialVenues }: FilterBarLogicProps) {
	const searchQuery = useStore(searchQueryStore);
	const selectedVenue = useStore(selectedVenueStore);
	const dateRange = useStore(dateRangeStore);
	const topVenue = useStore(topVisibleVenueStore);
	const selectedShow = useStore(selectedShowStore);

	const handleClearFilters = () => {
		searchQueryStore.set("");
		selectedVenueStore.set(null);
		dateRangeStore.set(undefined);
	};

	return (
		<FilterBar
			initialVenues={initialVenues}
			searchQuery={searchQuery}
			selectedVenue={selectedVenue}
			dateRange={dateRange}
			topVenue={topVenue}
			selectedShow={selectedShow}
			onClearFilters={handleClearFilters}
		>
			{(isOpen, close) => isOpen && (
				<Suspense fallback={<div>Loading...</div>}>
					<FilterModalContentLogic initialVenues={initialVenues} close={close} />
				</Suspense>
			)}
		</FilterBar>
	);
}

import {
	ensureDateRangeLoaded,
} from "../../stores/dataActions";
import {
	debouncedSearchQueryStore,
	filteredShowsStore,
} from "../../stores/filteredShows";
import { FilterModalContent } from "@open-setlist/ui/src/components/ui/FilterModalContent";

export function FilterModalContentLogic({ initialVenues, close }: { initialVenues: Venue[], close: () => void }) {
	const searchQuery = useStore(searchQueryStore);
	const debouncedSearchQuery = useStore(debouncedSearchQueryStore);
	const selectedVenue = useStore(selectedVenueStore);
	const dateRange = useStore(dateRangeStore);
	const filteredShows = useStore(filteredShowsStore);

    return (
        <FilterModalContent
            initialVenues={initialVenues}
            close={close}
            searchQuery={searchQuery}
            debouncedSearchQuery={debouncedSearchQuery}
            selectedVenue={selectedVenue}
            dateRange={dateRange}
            filteredShowsCount={filteredShows.length}
            setSearchQuery={searchQueryStore.set}
            setSelectedVenue={selectedVenueStore.set}
            setDateRange={dateRangeStore.set}
            loadMonths={async (f: Date, t: Date) => { await ensureDateRangeLoaded(f, t); }}
        />
    )
}
