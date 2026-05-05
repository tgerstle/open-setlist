import Database from 'better-sqlite3';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

const DB_PATH = join('/Users/tgerstle/code/mkesetlist', 'data', 'localmusic.db');

/**
 * Local Live Music Tracker Data Health Check CLI
 * 
 * Purpose:
 * - Provide a baseline of data quality.
 * - Identify missing ticket URLs, genres, and metadata.
 * - Highlight specific venues with data gaps.
 */

function getDb() {
  if (!existsSync(DB_PATH)) {
    throw new Error(`Database not found at ${DB_PATH}`);
  }
  return new Database(DB_PATH, { readonly: true });
}

function checkHealth() {
  const db = getDb();
  
  console.log('\n📊 DEMO SETLIST DATA HEALTH CHECK\n' + '='.repeat(35));

  // 1. Overall Stats
  const totalShows = db.prepare("SELECT COUNT(*) as count FROM shows WHERE event_date >= date('now')").get().count;
  const totalVenues = db.prepare("SELECT COUNT(*) as count FROM venues").get().count;
  
  console.log(`\n📅 Upcoming Shows: ${totalShows}`);
  console.log(`📍 Active Venues:  ${totalVenues}`);

  // 2. Data Gaps
  const missingUrls = db.prepare("SELECT COUNT(*) as count FROM shows WHERE (ticket_url IS NULL OR ticket_url = '#' OR ticket_url = '') AND event_date >= date('now')").get().count;
  const missingGenres = db.prepare(`
    SELECT COUNT(s.id) as count 
    FROM shows s
    LEFT JOIN artists_metadata m ON s.artist_name = m.artist_name
    WHERE (m.genres IS NULL OR m.genres = '[]') AND s.event_date >= date('now')
  `).get().count;
  
  const canceledShows = db.prepare("SELECT COUNT(*) as count FROM shows WHERE is_canceled = 1 AND event_date >= date('now')").get().count;
  const soldOutShows = db.prepare("SELECT COUNT(*) as count FROM shows WHERE is_sold_out = 1 AND event_date >= date('now')").get().count;

  const urlHealth = (((totalShows - missingUrls) / totalShows) * 100).toFixed(1);
  const genreHealth = (((totalShows - missingGenres) / totalShows) * 100).toFixed(1);

  console.log(`\n🔗 Ticket URL Coverage: ${urlHealth}% (${totalShows - missingUrls}/${totalShows})`);
  console.log(`🎸 Genre Coverage:      ${genreHealth}% (${totalShows - missingGenres}/${totalShows})`);
  console.log(`🚫 Canceled Shows:      ${canceledShows}`);
  console.log(`🎟️  Sold Out Shows:      ${soldOutShows}`);

  // 3. Venue Breakdown
  console.log('\n🏘️  VENUE COVERAGE BREAKDOWN\n' + '-'.repeat(35));
  const venueStats = db.prepare(`
    SELECT 
      v.name,
      COUNT(s.id) as total,
      SUM(CASE WHEN s.ticket_url IS NULL OR s.ticket_url = '#' OR s.ticket_url = '' THEN 1 ELSE 0 END) as missing_urls
    FROM venues v
    LEFT JOIN shows s ON v.id = s.venue_id AND s.event_date >= date('now')
    GROUP BY v.id
    ORDER BY total DESC
  `).all();

  venueStats.forEach(v => {
    const urlPercent = v.total > 0 ? (((v.total - v.missing_urls) / v.total) * 100).toFixed(0) : 0;
    const statusIcon = parseInt(urlPercent) > 90 ? '✅' : parseInt(urlPercent) > 50 ? '⚠️' : '❌';
    console.log(`${statusIcon} ${v.name.padEnd(25)} | ${v.total.toString().padStart(3)} shows | ${urlPercent}% URLs`);
  });

  // 4. Sample Missing URLs
  if (missingUrls > 0) {
    console.log('\n🕵️  SAMPLE SHOWS MISSING URLS (Top 5)\n' + '-'.repeat(35));
    const samples = db.prepare(`
      SELECT artist_name, venue_id, event_date 
      FROM shows 
      WHERE (ticket_url IS NULL OR ticket_url = '#' OR ticket_url = '') AND event_date >= date('now')
      LIMIT 5
    `).all();
    samples.forEach(s => console.log(`- ${s.artist_name} @ ${s.venue_id} (${s.event_date})`));
  }

  console.log('\n' + '='.repeat(35) + '\n');
  db.close();
}

try {
  checkHealth();
} catch (err) {
  console.error(`💥 Health check failed: ${err.message}`);
}
