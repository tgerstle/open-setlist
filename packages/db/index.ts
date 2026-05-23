import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";

const findWorkspaceRoot = () => {
	let currentDir = "";
	if (typeof __dirname !== "undefined") currentDir = __dirname;
	else if (typeof import.meta !== "undefined" && import.meta.url)
		currentDir = dirname(fileURLToPath(import.meta.url));
	else currentDir = process.cwd();

	let dir = currentDir;
	while (dir !== "/" && dir !== "") {
		if (existsSync(join(dir, "pnpm-workspace.yaml"))) return dir;
		dir = dirname(dir);
	}
	return process.cwd();
};

export const initDb = (dbPath?: string) => {
	const root = findWorkspaceRoot();
	const finalDbPath =
		dbPath || process.env.DATABASE_PATH || resolve(root, "data/localmusic.db");
	const db = new Database(finalDbPath);
	const schemaPath =
		process.env.SCHEMA_PATH || join(root, "packages/db/schema.sql");
	const schema = readFileSync(schemaPath, "utf8");
	db.exec(schema);
	return db;
};

export const getVenues = (db: Database.Database) => {
	return db.prepare("SELECT * FROM venues").all();
};

export const insertShow = (db: Database.Database, show: any) => {
	const stmt = db.prepare(`
    INSERT INTO shows (id, venue_id, artist_name, event_date, event_time, ticket_url, is_sold_out, is_canceled, age_restriction, last_scanned_at, detail_url, enrichment_status, doors_time, price, description, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      artist_name=excluded.artist_name,
      event_date=excluded.event_date,
      event_time=excluded.event_time,
      ticket_url=excluded.ticket_url,
      is_sold_out=excluded.is_sold_out,
      is_canceled=excluded.is_canceled,
      age_restriction=excluded.age_restriction,
      last_scanned_at=excluded.last_scanned_at,
      detail_url=COALESCE(excluded.detail_url, shows.detail_url),
      enrichment_status=COALESCE(excluded.enrichment_status, shows.enrichment_status),
      doors_time=COALESCE(excluded.doors_time, shows.doors_time),
      price=COALESCE(excluded.price, shows.price),
      description=COALESCE(excluded.description, shows.description),
      image_url=COALESCE(excluded.image_url, shows.image_url)
  `);
	return stmt.run(
		show.id,
		show.venue_id,
		show.artist_name,
		show.event_date,
		show.event_time,
		show.ticket_url,
		show.is_sold_out ? 1 : 0,
		show.is_canceled ? 1 : 0,
		show.age_restriction,
		show.last_scanned_at,
		show.detail_url || null,
		show.enrichment_status || "pending",
		show.doors_time || null,
		show.price || null,
		show.description || null,
		show.image_url || null,
	);
};

export const getPendingShows = (db: Database.Database, limit: number = 100) => {
	const stmt = db.prepare(
		`SELECT * FROM shows WHERE enrichment_status = 'pending' AND detail_url IS NOT NULL LIMIT ?;`,
	);
	return stmt.all(limit) as any[];
};

export const updateShowEnrichment = (
	db: Database.Database,
	id: string,
	data: any,
) => {
	const fields = [];
	const values = [];

	if (data.enrichment_status !== undefined) {
		fields.push("enrichment_status = ?");
		values.push(data.enrichment_status);
	}
	if (data.doors_time !== undefined) {
		fields.push("doors_time = ?");
		values.push(data.doors_time);
	}
	if (data.price !== undefined) {
		fields.push("price = ?");
		values.push(data.price);
	}
	if (data.description !== undefined) {
		fields.push("description = ?");
		values.push(data.description);
	}
	if (data.image_url !== undefined) {
		fields.push("image_url = ?");
		values.push(data.image_url);
	}
	if (data.event_time !== undefined) {
		fields.push("event_time = ?");
		values.push(data.event_time);
	}

	if (fields.length === 0) return;

	const query = `UPDATE shows SET ${fields.join(", ")} WHERE id = ?`;
	values.push(id);

	const stmt = db.prepare(query);
	return stmt.run(...values);
};
