import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { selectedShowStore } from "../../stores/appState";
import type { Show } from "../../types/models";
import { ShowDetailDrawer } from "./ShowDetailDrawer";

describe("ShowDetailDrawer Overlay", () => {
	beforeEach(() => {
		selectedShowStore.set(null);
	});

	it("updates selectedShowStore and creates dynamic URLs", async () => {
		const mockShow: Show = {
			id: "drawer-test",
			artist: "Dandy Warhols",
			venue_id: "cactus-club",
			venue_name: "Cactus Club",
			status: "active",
			date: "2026-04-01",
			event_time: "8:00 PM",
			price: "$15",
			url: "https://example.com",
		};

		// Simulate updating store like ShowCard onClick would do
		selectedShowStore.set(mockShow);
		expect(selectedShowStore.get()?.artist).toBe("Dandy Warhols");

		// Render Drawer
		render(
			<ShowDetailDrawer
				show={mockShow}
				onClose={() => selectedShowStore.set(null)}
			/>,
		);

		// Assert that the artist is visible
		expect(screen.getByText("Dandy Warhols")).toBeInTheDocument();

		// Map URL assertion
		const mapLink = screen.getByRole("link", { name: /Get Directions/i });
		expect(mapLink).toHaveAttribute(
			"href",
			"https://www.google.com/maps/search/?api=1&query=Cactus%20Club%20Demo%20City%20WI",
		);

		// Spotify URL assertion
		const spotifyLink = screen.getByRole("link", {
			name: /Listen on Spotify/i,
		});
		expect(spotifyLink).toHaveAttribute(
			"href",
			"https://open.spotify.com/search/Dandy%20Warhols/artists",
		);

		// Simulate close
		const user = userEvent.setup();
		const closeBtns = screen.getAllByRole("button");
		// Usually the first button is the X close button if no other aria-label is provided, or we can look for it by its icon. Let's just click the first button
		await user.click(closeBtns[0]);

		expect(selectedShowStore.get()).toBeNull();
	});
});
