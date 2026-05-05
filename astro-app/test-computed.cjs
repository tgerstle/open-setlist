const fs = require('fs');

// emulate the store dependencies:
let earliestVisibleDate = '2026-05-03';
let search = 'the new pornographers – the former site of tour';
let dateRange = undefined;
let venue = null;
let events = JSON.parse(fs.readFileSync('astro-app/dist/client/data/events/2026-05.json', 'utf-8'));

let filtered = [...events];

// The actual code from filteredShows.ts:
if (!dateRange?.from && !search) {
  filtered = filtered.filter((show) => {
    const evDate = show.event_date || show.date;
    return evDate && evDate >= earliestVisibleDate;
  });
}

if (search) {
  const query = search.toLowerCase();
  filtered = filtered.filter(
    (show) => {
      const artistName = show.artist_name || show.artist || '';
      const venueName = show.venue_name || '';
      return artistName.toLowerCase().includes(query) ||
        venueName.toLowerCase().includes(query);
    }
  );
}

if (venue) {
  filtered = filtered.filter((show) => show.venue_id === venue);
}

if (dateRange && dateRange.from) {
  // Keep this simple for now
  filtered = filtered.filter((show) => {
    const evDate = show.event_date || show.date;
    return evDate && evDate >= dateRange.from;
  });
  if (dateRange.to) {
    filtered = filtered.filter((show) => {
      const evDate = show.event_date || show.date;
      return evDate && evDate <= dateRange.to;
    });
  }
}

console.log('Filtered Shows Length:', filtered.length);
