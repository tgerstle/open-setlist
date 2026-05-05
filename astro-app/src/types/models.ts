export type ThemeColor = 'blue' | 'sky' | 'fuchsia' | 'orange' | 'red' | 'amber' | 'indigo' | 'slate' | 'purple' | 'emerald' | 'teal' | 'pink' | 'lime' | 'cyan' | 'yellow';

export interface Venue {
  id: string;
  name: string;
  short_name?: string;
  theme_color?: ThemeColor;
  website_url?: string | null;
  coordinates?: string | null;
  neighborhood?: string | null;
}

export interface Show {
  id: string;
  date?: string;
  event_date?: string; // Sometimes components allow either
  artist: string;
  artist_name?: string;
  event_time?: string | null;
  venue_id: string;
  venue_name: string;
  venue_short_name?: string;
  venue_theme_color?: ThemeColor;
  status: "active" | "canceled";
  added_at?: string;
  ticket_url?: string | null;
  price?: string | number | null;
  ticket_price?: string | number | null;
  last_scanned_at?: string | null;
  is_sold_out?: boolean | number; // SQLite sometimes returns 1/0
  age_restriction?: string | null;
  detail_url?: string | null;
  enrichment_status?: 'none' | 'pending' | 'completed' | 'failed';
  doors_time?: string | null;
  description?: string | null;
  image_url?: string | null;
  url?: string;
  time?: string;
}

export type ViewType = "feed" | "month" | "map";

export interface DateRange {
  from: string | null;
  to: string | null;
}

declare global {
  interface Window {
    _loadOlderShows?: () => void;
    _loadNewerShows?: () => void;
    _loadingShows?: boolean;
    _loadedMonths?: string[];
  }
}
