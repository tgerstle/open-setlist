export type ThemeColor = 'blue' | 'sky' | 'fuchsia' | 'orange' | 'red' | 'amber' | 'indigo' | 'slate' | 'purple' | 'emerald' | 'teal' | 'pink' | 'lime' | 'cyan' | 'yellow';

export interface Venue {
  id: string; // slug
  name: string;
  short_name?: string;
  theme_color?: ThemeColor;
  address: string;
  website_url: string;
  scraper_type: "pabst" | "rave" | "cactus" | "generic";
  latitude: number | null;
  longitude: number | null;
  neighborhood: string | null;
}

export interface Show {
  id: string; // UUID (e.g., venue-artist-date)
  venue_id: string;
  venue_short_name?: string;
  venue_theme_color?: ThemeColor;
  artist_name: string;
  event_date: string; // ISO 8601 (YYYY-MM-DD)
  event_time: string | null;
  ticket_url: string | null;
  is_sold_out: boolean;
  age_restriction: string | null;
  last_scanned_at: string;
  detail_url?: string | null;
  enrichment_status?: 'none' | 'pending' | 'completed' | 'failed';
  doors_time?: string | null;
  price?: string | null;
  description?: string | null;
  image_url?: string | null;
}

export interface ArtistMetadata {
  artist_name: string;
  genres: string[]; // JSON array in DB
  sounds_like: string[]; // JSON array in DB
  is_mke_local: boolean;
  spotify_id: string | null;
  bandcamp_url: string | null;
  last_enriched_at: string;
}

export interface DashboardHealthStats {
  totalUpcomingShows: number;
  totalPassedShows: number;
  totalVenuesTracked: number;
  recentErrors: number;
}

export interface VenueOverviewRow {
  venue_id: string;
  venue_name: string;
  short_name?: string | null;
  theme_color?: string | null;
  website_url?: string | null;
  coordinates?: string | null;
  last_scanned_at: string | null;
  upcoming_shows: number;
  passed_shows: number;
  status: "healthy" | "error" | "stale";
}

export interface EventRow {
  id: string;
  date: string;
  artist: string;
  venue_id: string;
  venue_name: string;
  status: "active" | "canceled";
  added_at: string;
}

export interface EventDetail extends EventRow {
  ticket_url: string | null;
  is_sold_out: boolean;
  age_restriction: string | null;
}
