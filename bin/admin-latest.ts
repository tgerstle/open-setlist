import Database from 'better-sqlite3';
import { join } from 'node:path';

const DB_PATH = join(process.cwd(), 'data', 'localmusic.db');

function getLatestImports(limit = 20) {
  const db = new Database(DB_PATH, { readonly: true });
  const query = `
    SELECT 
      s.artist_name, 
      v.name as venue_name,
      s.event_date,
      s.last_scanned_at
    FROM shows s
    JOIN venues v ON s.venue_id = v.id
    ORDER BY s.last_scanned_at DESC
    LIMIT ?
  `;
  try {
    return db.prepare(query).all(limit);
  } catch (err) {
    console.error('Failed to query database:', err);
    return [];
  } finally {
    db.close();
  }
}

const imports = getLatestImports();

if (imports.length === 0) {
  console.log('No recent imports found.');
} else {
  console.log('\n--- Latest 20 Imports ---');
  console.table(imports);
}
