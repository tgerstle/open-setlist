import Database from 'better-sqlite3';
import { join } from 'node:path';
import { statSync } from 'node:fs';

const DB_PATH = join(process.cwd(), '..', 'data', 'mkesetlist.db');

export function getDb() {
  return new Database(DB_PATH, { readonly: true });
}

export function getDbMtime() {
  try {
    const stats = statSync(DB_PATH);
    return stats.mtimeMs;
  } catch (e) {
    console.error('Failed to get DB mtime:', e);
    return 0;
  }
}

export function getLatestImports(limit = 50) {
  const db = getDb();
  const query = `
    SELECT 
      s.*, 
      v.name as venue_name
    FROM shows s
    JOIN venues v ON s.venue_id = v.id
    ORDER BY s.last_scanned_at DESC
    LIMIT ?
  `;
  try {
    return db.prepare(query).all(limit);
  } finally {
    db.close();
  }
}
