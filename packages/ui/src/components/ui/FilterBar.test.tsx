import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FilterBar } from "./FilterBar";

describe("FilterBar", () => {
	it("renders filter bar and expects props", async () => {
		let cleared = false;
		render(<FilterBar initialVenues={[]} searchQuery="The Dandy Warhols" selectedVenue={null} dateRange={undefined} topVenue={null} selectedShow={null} onClearFilters={() => { cleared = true; }} />);
		
		const filtersBtn = screen.getByRole("button", { name: /Search & Filter/i });
		expect(filtersBtn).toBeInTheDocument();

        // The button has (1) since searchQuery is passed in
		const updatedFiltersBtn = screen.getByRole("button", { name: /1/i });
		expect(updatedFiltersBtn).toBeInTheDocument();
	});
});
