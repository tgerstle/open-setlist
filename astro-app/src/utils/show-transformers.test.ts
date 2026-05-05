import { describe, it, expect } from "vitest";
import { groupByDate, aggregateShowsByVenue } from "./show-transformers";
import type { Show, Venue } from "../types/models";

describe("show-transformers", () => {
  describe("groupByDate", () => {
    it("should group shows by date and maintain order", () => {
      const shows: Show[] = [
        {
          id: "1",
          artist: "Artist A",
          date: "2026-04-01",
          venue_id: "v1",
          venue_name: "Venue 1",
          status: "active",
        },
        {
          id: "2",
          artist: "Artist B",
          date: "2026-04-02",
          venue_id: "v1",
          venue_name: "Venue 1",
          status: "active",
        },
        {
          id: "3",
          artist: "Artist C",
          date: "2026-04-01",
          venue_id: "v2",
          venue_name: "Venue 2",
          status: "active",
        },
      ];

      const result = groupByDate(shows);

      expect(result.groups).toEqual(["2026-04-01", "2026-04-02"]);
      expect(result.groupCounts).toEqual([2, 1]);
      expect(result.groupedShows[0].artist).toBe("Artist A");
      expect(result.groupedShows[1].artist).toBe("Artist C");
      expect(result.groupedShows[2].artist).toBe("Artist B");
    });

    it("should handle empty input", () => {
      const result = groupByDate([]);
      expect(result.groups).toEqual([]);
      expect(result.groupCounts).toEqual([]);
      expect(result.groupedShows).toEqual([]);
    });

    it("should use event_date if date is missing", () => {
      const shows: Show[] = [
        {
          id: "1",
          artist: "Artist A",
          event_date: "2026-04-05",
          venue_id: "v1",
          venue_name: "Venue 1",
          status: "active",
        },
      ] as Show[];
      const result = groupByDate(shows);
      expect(result.groups).toEqual(["2026-04-05"]);
    });
  });

  it("should handle missing dates", () => {
    const shows: Show[] = [
      {
        id: "m1",
        artist: "No Date",
        venue_id: "v1",
        venue_name: "Venue 1",
        status: "active",
      } as Show,
    ];
    const result = groupByDate(shows);
    expect(result.groups).toEqual(["Unknown Date"]);
    expect(result.groupedShows[0].artist).toBe("No Date");
  });

  it("should handle sorting dates correctly, including malformed ones", () => {
    const shows: Show[] = [
      { id: "1", artist: "B", date: "2026-04-02", venue_id: "v", venue_name: "v", status: "active" },
      { id: "2", artist: "C", date: "invalid-date", venue_id: "v", venue_name: "v", status: "active" },
      { id: "3", artist: "A", date: "2026-04-01", venue_id: "v", venue_name: "v", status: "active" },
    ];
    const result = groupByDate(shows);
    expect(result.groupedShows[0].artist).toBe("C");
    expect(result.groupedShows[1].artist).toBe("A");
    expect(result.groupedShows[2].artist).toBe("B");
  });

  describe("aggregateShowsByVenue", () => {
    it("should include venues with no shows if they have a name", () => {
      const venues: Venue[] = [
        { id: "v1", name: "Venue 1", coordinates: "43.1,-87.9" }
      ];
      const shows: Show[] = [];
      const result = aggregateShowsByVenue(shows, venues);
      expect(result).toHaveLength(1);
      expect(result[0].shows).toHaveLength(0);
      expect(result[0].venue.name).toBe("Venue 1");
    });

    it("should aggregate shows into venues with coordinates", () => {
      const venues: Venue[] = [
        { id: "v1", name: "Venue 1", coordinates: "43.1,-87.9" },
        { id: "v2", name: "Venue 2", coordinates: "43.2,-87.8" },
        { id: "v3", name: "Venue 3" }, // No coordinates
      ];
      const shows: Show[] = [
        {
          id: "s1",
          artist: "A",
          venue_id: "v1",
          venue_name: "V1",
          status: "active",
        },
        {
          id: "s2",
          artist: "B",
          venue_id: "v1",
          venue_name: "V1",
          status: "active",
        },
        {
          id: "s3",
          artist: "C",
          venue_id: "v2",
          venue_name: "V2",
          status: "active",
        },
        {
          id: "s4",
          artist: "D",
          venue_id: "v3",
          venue_name: "V3",
          status: "active",
        },
      ] as Show[];

      const result = aggregateShowsByVenue(shows, venues);

      expect(result).toHaveLength(2);
      expect(result.find((d) => d.venue.id === "v1")?.shows).toHaveLength(2);
      expect(result.find((d) => d.venue.id === "v2")?.shows).toHaveLength(1);
    });
  });
});
