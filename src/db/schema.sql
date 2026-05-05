-- Phase 1 Schema: MKE Setlist

CREATE TABLE IF NOT EXISTS venues (
  id TEXT PRIMARY KEY, -- slug (e.g., pabst-theater)
  name TEXT NOT NULL,
  short_name TEXT,
  theme_color TEXT,
  address TEXT,
  website_url TEXT,
  scraper_type TEXT,
  latitude REAL,
  longitude REAL,
  neighborhood TEXT
);

CREATE TABLE IF NOT EXISTS shows (
  id TEXT PRIMARY KEY, -- combined slug (venue_id-artist-date)
  venue_id TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  event_date TEXT NOT NULL, -- YYYY-MM-DD
  event_time TEXT,
  ticket_url TEXT,
  is_sold_out INTEGER DEFAULT 0, -- 0 = false, 1 = true
  is_canceled INTEGER DEFAULT 0, -- 0 = false, 1 = true
  age_restriction TEXT,
  last_scanned_at TEXT,
  detail_url TEXT,
  enrichment_status TEXT DEFAULT 'pending',
  doors_time TEXT,
  price TEXT,
  description TEXT,
  image_url TEXT,
  FOREIGN KEY(venue_id) REFERENCES venues(id)
);

CREATE TABLE IF NOT EXISTS artists_metadata (
  artist_name TEXT PRIMARY KEY,
  genres TEXT, -- JSON array string
  sounds_like TEXT, -- JSON array string
  is_mke_local INTEGER DEFAULT 0, -- 0 = false, 1 = true
  spotify_id TEXT,
  bandcamp_url TEXT,
  last_enriched_at TEXT
);
