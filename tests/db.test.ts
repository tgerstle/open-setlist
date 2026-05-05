import { describe, it, expect, beforeEach } from 'vitest';
import { initDb, getVenues, insertShow } from '../src/db/index';
import type { Show } from '../src/types/index';

describe('Database Infrastructure (Phase 1)', () => {
  let db;

  beforeEach(() => {
    // Use an in-memory database for testing to keep it fast and clean
    db = initDb(':memory:');
  });

  it('should create the correct schema', () => {
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    const tableNames = tables.map((t: any) => t.name);

    expect(tableNames).toContain('venues');
    expect(tableNames).toContain('shows');
    expect(tableNames).toContain('artists_metadata');
  });

  it('should allow inserting and retrieving a show', () => {
    // 1. Seed a venue (since shows has a FK to venues)
    db.prepare('INSERT INTO venues (id, name) VALUES (?, ?)').run('cactus-club', 'Cactus Club');

    // 2. Insert a show
    const mockShow: Show = {
      id: 'cactus-club-the-gufs-2026-03-01',
      venue_id: 'cactus-club',
      artist_name: 'The Gufs',
      event_date: '2026-03-01',
      event_time: '8:00 PM',
      ticket_url: 'https://cactusclubmke.com/tickets',
      is_sold_out: false,
      age_restriction: '21+',
      last_scanned_at: new Date().toISOString(),
      detail_url: 'https://cactusclubmke.com/shows/the-gufs',
      enrichment_status: 'pending',
      doors_time: '7:00 PM',
      price: '$15',
      description: 'A great show',
      image_url: 'https://cactusclubmke.com/images/the-gufs.jpg'

  it('should update an existing show via upsert (ON CONFLICT)', () => {
      db.prepare('INSERT INTO venues (id, name) VALUES (?, ?)').run('cactus-club', 'Cactus Club');

      const showId = 'cactus-club-the-gufs-2026-03-01';
      const initialShow = {
        id: showId,
        venue_id: 'cactus-club',
        artist_name: 'The Gufs',
        event_date: '2026-03-01',
        is_sold_out: false,
        last_scanned_at: '2026-02-28T00:00:00Z'
      };

      insertShow(db, initialShow);

      // Update the same show (sold out now)
      const updatedShow = { ...initialShow, is_sold_out: true, last_scanned_at: '2026-03-01T00:00:00Z' };
      insertShow(db, updatedShow);

      const show = db.prepare('SELECT * FROM shows WHERE id = ?').get(showId);
      expect(show.is_sold_out).toBe(1);
      expect(show.last_scanned_at).toBe('2026-03-01T00:00:00Z');
    });
});
