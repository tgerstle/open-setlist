import { join } from "node:path";
import Database from "better-sqlite3";

const DB_PATH =
	process.env.DATABASE_PATH ||
	join(process.cwd(), "..", "data", "localmusic.db");

export function getDb() {
	return new Database(DB_PATH, { readonly: true });
}

export function getUpcomingShows() {
	const db = getDb();
	const query = `
    SELECT 
      s.*, 
      v.name as venue_name, 
      v.short_name as venue_short_name,
      v.theme_color as venue_theme_color,
      v.neighborhood,
      m.genres,
      m.is_local
    FROM shows s
    JOIN venues v ON s.venue_id = v.id
    LEFT JOIN artists_metadata m ON s.artist_name = m.artist_name
    WHERE s.event_date >= date('now')
    ORDER BY s.event_date ASC
  `;
	return db.prepare(query).all();
}

export function getAllVenues() {
	const db = getDb();
	return db.prepare("SELECT * FROM venues ORDER BY name ASC").all();
}
