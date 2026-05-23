import type Database from "better-sqlite3";
import type { ArtistMetadata } from "../types";

export interface EnrichmentAgent {
	researchArtist: (
		name: string,
	) => Promise<Omit<ArtistMetadata, "last_enriched_at">>;
}

export const runEnrichment = async (
	db: Database.Database,
	agent: EnrichmentAgent,
) => {
	console.log("🔍 Starting Artist Enrichment...");

	// 1. Find artists in 'shows' table that are NOT in 'artists_metadata'
	const newArtists = db
		.prepare(`
    SELECT DISTINCT s.artist_name 
    FROM shows s
    LEFT JOIN artists_metadata m ON s.artist_name = m.artist_name
    WHERE m.artist_name IS NULL
  `)
		.all() as { artist_name: string }[];

	if (newArtists.length === 0) {
		console.log("✅ No new artists to enrich.");
		return;
	}

	console.log(`✨ Found ${newArtists.length} new artists to research.`);

	const upsertMetadata = db.prepare(`
    INSERT INTO artists_metadata (
      artist_name, genres, sounds_like, is_local, spotify_id, bandcamp_url, last_enriched_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(artist_name) DO UPDATE SET
      genres=excluded.genres,
      sounds_like=excluded.sounds_like,
      is_local=excluded.is_local,
      spotify_id=excluded.spotify_id,
      bandcamp_url=excluded.bandcamp_url,
      last_enriched_at=excluded.last_enriched_at
  `);

	for (const { artist_name } of newArtists) {
		try {
			console.log(`   🎨 Researching metadata for "${artist_name}"...`);
			const metadata = await agent.researchArtist(artist_name);

			upsertMetadata.run(
				metadata.artist_name,
				JSON.stringify(metadata.genres),
				JSON.stringify(metadata.sounds_like),
				metadata.is_local ? 1 : 0,
				metadata.spotify_id,
				metadata.bandcamp_url,
				new Date().toISOString(),
			);

			console.log(`      ✅ Enriched: ${metadata.genres.join(", ")}`);
		} catch (err: any) {
			console.error(`      ❌ Failed to enrich "${artist_name}":`, err.message);
		}
	}

	console.log("🎉 Enrichment complete.");
};
