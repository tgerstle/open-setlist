import Database from 'better-sqlite3';
import { join } from 'node:path';
import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';

const DB_PATH = join('/Users/tgerstle/code/mkesetlist', 'data', 'mkesetlist.db');
const STAGING_DIR = join('/Users/tgerstle/code/mkesetlist', 'data', 'enrichment_staging');

function getDb() {
  if (!existsSync(DB_PATH)) {
    throw new Error(`Database not found at ${DB_PATH}`);
  }
  return new Database(DB_PATH);
}

function ensureStagingDir() {
  if (!existsSync(STAGING_DIR)) {
    mkdirSync(STAGING_DIR, { recursive: true });
  }
}

export function stageMissingArtists() {
  const db = getDb();
  ensureStagingDir();

  console.log('🔍 Scanning for artists missing metadata...');

  const missing = db.prepare(`
    SELECT DISTINCT s.artist_name 
    FROM shows s
    LEFT JOIN artists_metadata m ON s.artist_name = m.artist_name
    WHERE m.artist_name IS NULL
    ORDER BY s.artist_name ASC
  `).all();

  if (missing.length === 0) {
    console.log('✅ All current artists have metadata entries.');
    return;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `proposal-${timestamp}.json`;
  const filePath = join(STAGING_DIR, filename);

  const proposal = {
    generated_at: new Date().toISOString(),
    status: 'pending_review',
    artists: missing.map(a => ({
      artist_name: a.artist_name,
      genres: ["Genre Pending"],
      is_mke_local: false,
      sounds_like: [],
      spotify_id: null,
      bandcamp_url: null,
      notes: "Auto-staged for review"
    }))
  };

  writeFileSync(filePath, JSON.stringify(proposal, null, 2));
  console.log(`✨ Staged ${missing.length} artists to: ${filePath}`);
  console.log(`👉 Edit this file to add genres/metadata, then run 'commit' command.`);
  
  db.close();
}

export function commitProposal(filename) {
  const db = getDb();
  const filePath = join(STAGING_DIR, filename);

  if (!existsSync(filePath)) {
    console.error(`❌ Proposal file not found: ${filePath}`);
    return;
  }

  const data = JSON.parse(readFileSync(filePath, 'utf8'));
  
  const upsertStmt = db.prepare(`
    INSERT INTO artists_metadata (
      artist_name, genres, sounds_like, is_mke_local, spotify_id, bandcamp_url, last_enriched_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(artist_name) DO UPDATE SET
      genres=excluded.genres,
      sounds_like=excluded.sounds_like,
      is_mke_local=excluded.is_mke_local,
      spotify_id=excluded.spotify_id,
      bandcamp_url=excluded.bandcamp_url,
      last_enriched_at=excluded.last_enriched_at
  `);

  const transaction = db.transaction((artists) => {
    for (const artist of artists) {
      upsertStmt.run(
        artist.artist_name,
        JSON.stringify(artist.genres),
        JSON.stringify(artist.sounds_like),
        artist.is_mke_local ? 1 : 0,
        artist.spotify_id,
        artist.bandcamp_url,
        new Date().toISOString()
      );
    }
  });

  transaction(data.artists);
  console.log(`🎉 Successfully committed ${data.artists.length} artists from ${filename} to the database.`);
  
  db.close();
}

const [,, command, arg] = process.argv;

if (command === 'stage') {
  stageMissingArtists();
} else if (command === 'commit') {
  if (!arg) {
    console.error('❌ Usage: node bin/enrichment-tool.js commit <filename>');
  } else {
    commitProposal(arg);
  }
} else {
  console.log('MKE Setlist Enrichment Tool');
  console.log('Commands:');
  console.log('  stage           - Find missing artists and create a proposal JSON');
  console.log('  commit <file>   - Save an approved proposal JSON to the database');
}
