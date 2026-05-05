import { describe, it, expect, vi } from 'vitest';
import { runScraper } from '../core/runner';
import { pabstScraper } from '../plugins/pabst';
import { initDb } from '../src/db/index';

describe('Scraper Engine (Phase 2)', () => {
  it('should run a plugin and update the database with the results', async () => {
    // 1. Setup in-memory DB
    const db = initDb(':memory:');
    db.prepare('INSERT INTO venues (id, name) VALUES (?, ?)').run('pabst-theater', 'The Pabst Theater');

    // 2. Mock a Scraper Plugin instead of hitting a live site (Integration Test)
    const mockPlugin = vi.fn().mockResolvedValue({
      venue_id: 'pabst-theater',
      shows: [
        {
          artist_name: 'Bridget Everett',
          event_date: '2026-03-03',
          event_time: '8:00 PM',
          ticket_url: 'https://axs.com/bridget-everett',
          is_sold_out: false,
          age_restriction: '18+'
        }
      ],
      timestamp: new Date().toISOString(),
      status: 'success',
      errors: []
    });

    // 3. Run the scraper (mocking the URL navigation for the runner)
    // In a real test we might use MSW or a local HTML file, but for this step
    // we are verifying the runner's flow and DB insertion logic.
    await runScraper('pabst-theater', 'https://example.com', mockPlugin, db);

    // 4. Verify results in DB
    const show = db.prepare('SELECT * FROM shows WHERE venue_id = ?').get('pabst-theater');
    expect(show).toBeDefined();
    expect(show.artist_name).toBe('Bridget Everett');
    expect(show.event_date).toBe('2026-03-03');
    expect(mockPlugin).toHaveBeenCalled();
  });

  it('should generate a JSON audit log after scraping', async () => {
    const db = initDb(':memory:');
    db.prepare('INSERT INTO venues (id, name) VALUES (?, ?)').run('pabst-theater', 'The Pabst Theater');

    const mockPlugin = vi.fn().mockResolvedValue({
      venue_id: 'pabst-theater',
      shows: [],
      timestamp: new Date().toISOString(),
      status: 'failed',
      errors: [{ error_type: 'NAV_FAIL', message: 'Test error' }]
    });

    const result = await runScraper('pabst-theater', 'https://example.com', mockPlugin, db);
    expect(result.status).toBe('failed');
    expect(result.errors[0].message).toBe('Test error');
  });
});
