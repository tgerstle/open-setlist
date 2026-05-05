import Database from "better-sqlite3";
import { resolve } from "node:path";
import type { APIRoute } from "astro";
import type { Show } from "../../../types/models";

export const prerender = true;

export async function getStaticPaths() {
  const DB_PATH = resolve("../data/localmusic.db");
  const db = new Database(DB_PATH, { readonly: true });

  // Fetch all shows, ordering sequentially By Date
  const allShows = db
    .prepare(
      `
    SELECT 
      s.id, s.event_date as date, s.artist_name as artist, 
      v.id as venue_id, v.name as venue_name, v.short_name as venue_short_name, v.theme_color as venue_theme_color,
      s.last_scanned_at as added_at,
      s.ticket_url, s.is_sold_out, s.age_restriction, s.event_time
    FROM shows s 
    JOIN venues v ON s.venue_id = v.id
    ORDER BY s.event_date ASC
  `,
    )
    .all() as (Show & { date: string; artist: string; venue_name: string; added_at: string })[];

  db.close();

  const paths: { params: { file: string }, props: { data: any } }[] = [];
  const monthlyBuckets = new Map<string, Show[]>();

  // Group shows by YYYY-MM
  for (const show of allShows) {
    const monthKey = show.date.substring(0, 7); // e.g., "2026-04"
    if (!monthlyBuckets.has(monthKey)) {
      monthlyBuckets.set(monthKey, []);
    }
    monthlyBuckets.get(monthKey)!.push({
      ...show,
      is_sold_out: Boolean(show.is_sold_out),
    });
  }

  // Create explicit /[YYYY-MM].json static endpoints
  for (const [monthKey, shows] of monthlyBuckets.entries()) {
    paths.push({
      params: { file: monthKey },
      props: { data: shows },
    });
  }

  // Generate the new Manifest File
  const availableMonths = Array.from(monthlyBuckets.keys()).sort();
  const manifest = {
    availableMonths,
    totalShows: allShows.length,
    lastUpdated: new Date().toISOString(),
  };

  paths.push({
    params: { file: "manifest" },
    props: { data: manifest },
  });

  return paths;
}

export const GET: APIRoute = ({ props }) => {
  return new Response(JSON.stringify(props.data), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
