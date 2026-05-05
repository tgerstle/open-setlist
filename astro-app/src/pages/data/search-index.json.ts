import Database from "better-sqlite3";
import { resolve } from "node:path";
import type { APIRoute } from "astro";

export const prerender = true;

export const GET: APIRoute = () => {
    const DB_PATH = resolve("../data/mkesetlist.db");
    const db = new Database(DB_PATH, { readonly: true });

    const allShows = db
        .prepare(
            `
    SELECT s.event_date as date, s.artist_name as name, v.name as venue_name
    FROM shows s 
    JOIN venues v ON s.venue_id = v.id
    ORDER BY s.event_date ASC
  `,
        )
        .all() as { date: string; name: string; venue_name: string }[];

    db.close();

    const artistMap = new Map<string, Set<string>>();
    const venueMap = new Map<string, Set<string>>();

    for (const show of allShows) {
        if (!show.date) continue;
        const monthKey = show.date.substring(0, 7);

        if (show.name) {
            if (!artistMap.has(show.name)) artistMap.set(show.name, new Set());
            artistMap.get(show.name)!.add(monthKey);
        }

        if (show.venue_name) {
            if (!venueMap.has(show.venue_name)) venueMap.set(show.venue_name, new Set());
            venueMap.get(show.venue_name)!.add(monthKey);
        }
    }

    const results = [];
    for (const [name, months] of artistMap.entries()) {
        results.push({ term: name, type: "artist", months: Array.from(months).sort() });
    }
    for (const [name, months] of venueMap.entries()) {
        results.push({ term: name, type: "venue", months: Array.from(months).sort() });
    }

    return new Response(JSON.stringify(results), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
        },
    });
};
