import { filteredShowsStore, debouncedSearchQueryStore } from "./src/stores/filteredShows.js";
import { eventsStore } from "./src/stores/appState.js";

// Mock data
eventsStore.set([
  {
  "id": "turner-hall-ballroom-the-new-pornographers--the-former-site-of-tour-2026-05-01",
  "date": "2026-05-01",
  "artist": "The New Pornographers – The Former Site Of Tour",
  "venue_id": "turner-hall-ballroom",
  "venue_name": "Turner Hall Ballroom",
  "added_at": "2026-05-01T23:36:42.183Z",
  "ticket_url": "https://www.axs.com/events/1228128/the-new-pornographers-tickets?skin=pabst",
  "is_sold_out": false,
  "age_restriction": null,
  "event_time": ""
  }
]);

debouncedSearchQueryStore.set("The New Pornographers – The Former Site Of Tour");
console.log(filteredShowsStore.get().length);
