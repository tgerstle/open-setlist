import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";
import type {
	DashboardHealthStats,
	EventDetail,
	EventRow,
	VenueOverviewRow,
} from "../types";

const findWorkspaceRoot = () => {
	let currentDir = "";
	if (typeof __dirname !== "undefined") currentDir = __dirname;
	else if (typeof import.meta !== "undefined" && import.meta.url)
		currentDir = dirname(fileURLToPath(import.meta.url));
	else currentDir = process.cwd();

	// Walk up until we find pnpm-workspace.yaml
	let dir = currentDir;
	while (dir !== "/" && dir !== "") {
		if (existsSync(join(dir, "pnpm-workspace.yaml"))) {
			return dir;
		}
		dir = dirname(dir);
	}
	return process.cwd(); // Fallback
};

const getDb = () => {
	const root = findWorkspaceRoot();
	const dbPath =
		process.env.DATABASE_PATH || resolve(root, "data/localmusic.db");
	return new Database(dbPath);
};

export const getHealthStats = (): DashboardHealthStats => {
	const db = getDb();
	const now = new Date().toISOString();

	const stats = db
		.prepare(
			`
    SELECT 
      (SELECT count(*) FROM shows WHERE event_date >= ?) as upcoming,
      (SELECT count(*) FROM shows WHERE event_date < ?) as passed,
      (SELECT count(*) FROM venues) as venues
  `,
		)
		.get(now, now) as any;

	// TODO: Add logic to parse audit.log for recentErrors
	return {
		totalUpcomingShows: stats.upcoming,
		totalPassedShows: stats.passed,
		totalVenuesTracked: stats.venues,
		recentErrors: 0, // Placeholder
	};
};

export const getVenuesOverview = (): VenueOverviewRow[] => {
	const db = getDb();

	// 1. Get database aggregated counts
	const venueStats = db
		.prepare(
			`
    SELECT 
      v.id as venue_id,
      v.name as venue_name,
      v.short_name,
      v.theme_color,
      v.website_url,
      v.latitude,
      v.longitude,
      MAX(s.last_scanned_at) as last_successful_scan,
      SUM(CASE WHEN s.event_date >= date('now') THEN 1 ELSE 0 END) as upcoming_shows,
      SUM(CASE WHEN s.event_date < date('now') THEN 1 ELSE 0 END) as passed_shows
    FROM venues v
    LEFT JOIN shows s ON v.id = s.venue_id
    GROUP BY v.id
  `,
		)
		.all() as any[];

	// 2. Enhance with physical log file timestamps to find true "last attempted" scans
	const logsDir = resolve("/Users/tgerstle/code/mkesetlist/logs");
	let logFiles: string[] = [];
	try {
		if (existsSync(logsDir)) {
			logFiles = readdirSync(logsDir).filter(
				(f) => f.startsWith("scraper-") && f.endsWith(".json"),
			);
		}
	} catch (e) {
		console.error("Failed to read logs directory", e);
	}

	return venueStats.map((stat) => {
		// Find the most recent log file for this specific venue
		const venueLogs = logFiles
			.filter((f) => f.includes(`scraper-${stat.venue_id}-`))
			.sort() // Sorts by date string in filename ascending
			.reverse(); // Newest first

		let lastAttemptedAt = stat.last_successful_scan;

		if (venueLogs.length > 0) {
			const latestLogPath = join(logsDir, venueLogs[0]);
			try {
				const fileStat = statSync(latestLogPath);
				// Use the file modification time as the true last scan attempt
				const fileTime = new Date(fileStat.mtime).toISOString();

				// If the file is newer than the last successful DB insertion, use the file time
				if (
					!lastAttemptedAt ||
					new Date(fileTime) > new Date(lastAttemptedAt)
				) {
					lastAttemptedAt = fileTime;
				}
			} catch (_e) {}
		}

		// Determine Status
		let status: VenueOverviewRow["status"] = "healthy";
		if (!lastAttemptedAt) {
			status = "stale";
		} else if (stat.upcoming_shows === 0 && venueLogs.length > 0) {
			// If we recently tried to scan but found 0 shows, something is likely broken (e.g. Bremen)
			status = "error";
		} else if (
			Date.now() - new Date(lastAttemptedAt).getTime() >
			48 * 60 * 60 * 1000
		) {
			// Stale if older than 48 hours
			status = "stale";
		}

		return {
			venue_id: stat.venue_id,
			venue_name: stat.venue_name,
			short_name: stat.short_name,
			theme_color: stat.theme_color,
			website_url: stat.website_url,
			coordinates:
				stat.latitude && stat.longitude
					? `${stat.latitude},${stat.longitude}`
					: undefined,
			last_scanned_at: lastAttemptedAt,
			upcoming_shows: stat.upcoming_shows || 0,
			passed_shows: stat.passed_shows || 0,
			status,
		};
	});
};

export const getEvents = (
	venueId?: string,
	page: number = 1,
	limit: number = 50,
	sortCol: string = "date",
	sortDir: string = "DESC",
	startDate?: string,
	endDate?: string,
): { data: EventRow[]; total: number } => {
	const db = getDb();
	const offset = (page - 1) * limit;

	let query = `
    SELECT 
      s.id, s.event_date as date, s.artist_name as artist, 
      v.id as venue_id, v.name as venue_name, v.short_name as venue_short_name, v.theme_color as venue_theme_color,
      s.last_scanned_at as added_at
    FROM shows s
    JOIN venues v ON s.venue_id = v.id
  `;

	const params: any[] = [];
	const whereClauses: string[] = [];

	if (venueId) {
		whereClauses.push(`s.venue_id = ?`);
		params.push(venueId);
	}

	if (startDate) {
		whereClauses.push(`s.event_date >= ?`);
		params.push(startDate);
	}

	if (endDate) {
		whereClauses.push(`s.event_date <= ?`);
		params.push(endDate);
	}

	if (whereClauses.length > 0) {
		query += ` WHERE ${whereClauses.join(` AND `)}`;
	}

	const allowedSortCols = ["date", "artist", "added_at"];
	const safeSortCol = allowedSortCols.includes(sortCol) ? sortCol : "date";
	const safeSortDir = sortDir === "ASC" ? "ASC" : "DESC";

	query += ` ORDER BY ${safeSortCol} ${safeSortDir} LIMIT ? OFFSET ?`;
	params.push(limit, offset);

	const data = db.prepare(query).all(...params) as EventRow[];

	let countQuery = `SELECT count(*) as c FROM shows s`;
	if (whereClauses.length > 0) {
		countQuery += ` WHERE ${whereClauses.join(` AND `)}`;
	}

	// Count query needs the same filtering params but without limit/offset
	const countParams = params.slice(0, whereClauses.length);
	const total = (db.prepare(countQuery).get(...countParams) as any).c;

	return { data, total };
};

export const getEventDetails = (id: string): EventDetail | null => {
	const db = getDb();

	const event = db
		.prepare(
			`
    SELECT 
      s.id, 
      s.event_date as date, 
      s.artist_name as artist, 
      v.id as venue_id, 
      v.name as venue_name, 
      s.last_scanned_at as added_at,
      s.ticket_url,
      s.is_sold_out,
      s.age_restriction
    FROM shows s
    JOIN venues v ON s.venue_id = v.id
    WHERE s.id = ?
  `,
		)
		.get(id) as any;

	if (!event) return null;

	return {
		...event,
		status: "active", // Can refine this later if canceled logic applies
		is_sold_out: Boolean(event.is_sold_out),
	};
};

export const getVenueDetails = (id: string): any | null => {
	const db = getDb();

	const venue = db.prepare(`SELECT * FROM venues WHERE id = ?`).get(id);
	return venue || null;
};

export const updateVenueMetadata = (
	id: string,
	data: Partial<{
		address: string;
		website_url: string;
		timezone: string;
		coordinates: string;
	}>,
): boolean => {
	const db = getDb();

	// Dynamically build SET clause based on provided keys
	const updates: string[] = [];
	const params: any[] = [];

	for (const [key, value] of Object.entries(data)) {
		if (value !== undefined) {
			updates.push(`${key} = ?`);
			params.push(value);
		}
	}

	if (updates.length === 0) return false;

	params.push(id);
	const query = `UPDATE venues SET ${updates.join(", ")} WHERE id = ?`;

	const info = db.prepare(query).run(...params);
	return info.changes > 0;
};

export interface AuditLogEntry {
	timestamp: string;
	level: string;
	message: string;
}

export const getAuditLogs = (limit: number = 50): AuditLogEntry[] => {
	const auditLogPath = resolve(
		"/Users/tgerstle/code/mkesetlist/logs/audit.log",
	);
	if (!existsSync(auditLogPath)) {
		return [];
	}

	const fileContent = readFileSync(auditLogPath, "utf8");
	const lines = fileContent
		.trim()
		.split("\n")
		.filter((line) => line.trim() !== "");

	return lines
		.slice(-limit)
		.map((line) => {
			try {
				const parsed = JSON.parse(line);
				return {
					timestamp: parsed.timestamp || "",
					level: parsed.level || "INFO",
					message: parsed.event || line,
				};
			} catch (_e) {
				return { timestamp: "", level: "INFO", message: line };
			}
		})
		.reverse();
};
