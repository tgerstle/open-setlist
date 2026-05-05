const fs = require('fs');
const monthData = JSON.parse(fs.readFileSync('./dist/client/data/events/2026-05.json', 'utf-8'));
const query = 'the new pornographers – the former site of tour';

const search = query;
let filtered = [...monthData];

filtered = filtered.filter(show => {
  const artistName = show.artist_name || show.artist || '';
  const venueName = show.venue_name || '';
  return artistName.toLowerCase().includes(search) || venueName.toLowerCase().includes(search);
});

console.log('Results:', filtered.length);
