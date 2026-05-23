import { initDb } from "@open-setlist/db";
import { describe, expect, it, vi } from "vitest";
import { runEnrichment } from "../enrichment/engine";

describe("Artist Enrichment (Phase 3)", () => {
	it("should find un-enriched artists and populate metadata", async () => {
		// 1. Setup in-memory DB
		const db = initDb(":memory:");

		// Seed some shows (one new, one existing)
		db.prepare("INSERT INTO venues (id, name) VALUES (?, ?)").run(
			"cactus-club",
			"Cactus Club",
		);
		db.prepare(
			"INSERT INTO shows (id, venue_id, artist_name, event_date) VALUES (?, ?, ?, ?)",
		).run("1", "cactus-club", "The Gufs", "2026-03-01");
		db.prepare(
			"INSERT INTO shows (id, venue_id, artist_name, event_date) VALUES (?, ?, ?, ?)",
		).run("2", "cactus-club", "Bridget Everett", "2026-03-03");

		// Seed existing metadata for one
		db.prepare(
			"INSERT INTO artists_metadata (artist_name, genres, is_local) VALUES (?, ?, ?)",
		).run("Bridget Everett", '["Comedy"]', 0);

		// 2. Mock Enrichment Agent
		const mockAgent = {
			researchArtist: vi.fn().mockResolvedValue({
				artist_name: "The Gufs",
				genres: ["Alternative Rock", "Pop Rock"],
				sounds_like: ["Matchbox Twenty", "Gin Blossoms"],
				is_local: true,
				spotify_id: "spotify-id-123",
				bandcamp_url: null,
			}),
		};

		// 3. Run enrichment
		await runEnrichment(db, mockAgent);

		// 4. Verify results
		const gufsMeta = db
			.prepare("SELECT * FROM artists_metadata WHERE artist_name = ?")
			.get("The Gufs");
		expect(gufsMeta).toBeDefined();
		expect(gufsMeta.is_local).toBe(1);
		expect(JSON.parse(gufsMeta.genres)).toContain("Alternative Rock");

		// Verify the agent was only called for the NEW artist
		expect(mockAgent.researchArtist).toHaveBeenCalledTimes(1);
		expect(mockAgent.researchArtist).toHaveBeenCalledWith("The Gufs");
	});

	it("should handle enrichment failures gracefully", async () => {
		const db = initDb(":memory:");
		db.prepare("INSERT INTO venues (id, name) VALUES (?, ?)").run(
			"cactus-club",
			"Cactus Club",
		);
		db.prepare(
			"INSERT INTO shows (id, venue_id, artist_name, event_date) VALUES (?, ?, ?, ?)",
		).run("1", "cactus-club", "Unknown Band", "2026-03-01");

		const mockAgent = {
			researchArtist: vi.fn().mockRejectedValue(new Error("Artist not found")),
		};

		await runEnrichment(db, mockAgent);

		const metaCount = db
			.prepare("SELECT COUNT(*) as count FROM artists_metadata")
			.get().count;
		expect(metaCount).toBe(0); // Should remain empty on failure
	});
});
