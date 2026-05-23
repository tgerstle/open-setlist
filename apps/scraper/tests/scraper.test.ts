import { initDb } from "@open-setlist/db";
import { describe, expect, it, vi } from "vitest";
import { runScraper } from "../core/runner";

describe("Scraper Engine (Phase 2)", () => {
	it("should run a plugin and update the database with the results", async () => {
		// 1. Setup in-memory DB
		const db = initDb(":memory:");
		db.prepare("INSERT INTO venues (id, name) VALUES (?, ?)").run(
			"example-venue",
			"Example Venue",
		);

		// 2. Mock a Scraper Plugin instead of hitting a live site (Integration Test)
		const mockPlugin = vi.fn().mockResolvedValue({
			venue_id: "example-venue",
			shows: [
				{
					artist_name: "Bridget Everett",
					event_date: "2026-03-03",
					event_time: "8:00 PM",
					ticket_url: "https://axs.com/bridget-everett",
					is_sold_out: false,
					age_restriction: "18+",
				},
			],
			timestamp: new Date().toISOString(),
			status: "success",
			errors: [],
		});

		// 3. Run the scraper
		await runScraper("example-venue", "https://example.com", mockPlugin, db);

		// 4. Verify results in DB
		const show = db
			.prepare("SELECT * FROM shows WHERE venue_id = ?")
			.get("example-venue") as any;
		expect(show).toBeDefined();
		expect(show.artist_name).toBe("Bridget Everett");
		expect(show.event_date).toBe("2026-03-03");
		expect(mockPlugin).toHaveBeenCalled();
	});

	it("should generate a JSON audit log after scraping", async () => {
		const db = initDb(":memory:");
		db.prepare("INSERT INTO venues (id, name) VALUES (?, ?)").run(
			"example-venue",
			"Example Venue",
		);

		const mockPlugin = vi.fn().mockResolvedValue({
			venue_id: "example-venue",
			shows: [],
			timestamp: new Date().toISOString(),
			status: "failed",
			errors: [{ error_type: "NAV_FAIL", message: "Test error" }],
		});

		const result = await runScraper(
			"example-venue",
			"https://example.com",
			mockPlugin,
			db,
		);
		expect(result?.status).toBe("failed");
		expect(result?.errors[0].message).toBe("Test error");
	});
});
