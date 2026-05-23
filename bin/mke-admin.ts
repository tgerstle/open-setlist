import { getHealthStats, getVenuesOverview, getEvents, getEventDetails, getVenueDetails, updateVenueMetadata } from '@open-setlist/db/admin-queries';

const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'health':
    console.log(JSON.stringify(getHealthStats(), null, 2));
    break;
  case 'venues':
    console.log(JSON.stringify(getVenuesOverview(), null, 2));
    break;
  case 'events':
    // Basic argument parsing
    const venueId = args.find(a => a.startsWith('--venue='))?.split('=')[1];
    const page = parseInt(args.find(a => a.startsWith('--page='))?.split('=')[1] || '1', 10);
    const limit = parseInt(args.find(a => a.startsWith('--limit='))?.split('=')[1] || '50', 10);
    const sortCol = (args.find(a => a.startsWith('--sortCol='))?.split('=')[1] || 'date') as any;
    const sortDir = (args.find(a => a.startsWith('--sortDir='))?.split('=')[1] || 'DESC') as any;

    console.log(JSON.stringify(getEvents(venueId, page, limit, sortCol, sortDir), null, 2));
    break;
  case 'event':
    const eventId = args[1];
    if (!eventId) {
      console.error('Usage: tsx brand-admin.ts event <event_id>');
      process.exit(1);
    }
    console.log(JSON.stringify(getEventDetails(eventId), null, 2));
    break;
  case 'venue':
    const targetVenue = args[1];
    if (!targetVenue) {
      console.error('Usage: tsx brand-admin.ts venue <venue_id>');
      process.exit(1);
    }
    console.log(JSON.stringify(getVenueDetails(targetVenue), null, 2));
    break;
  case 'update-venue':
    const updateVenueId = args[1];
    if (!updateVenueId) {
      console.error('Usage: tsx brand-admin.ts update-venue <venue_id> [--address="..."] [--url="..."]');
      process.exit(1);
    }
    
    const patchData: any = {};
    const addressArg = args.find(a => a.startsWith('--address='))?.split('=')[1];
    const urlArg = args.find(a => a.startsWith('--url='))?.split('=')[1];
    const tzArg = args.find(a => a.startsWith('--timezone='))?.split('=')[1];
    const coordArg = args.find(a => a.startsWith('--coordinates='))?.split('=')[1];

    // Handle quoted string removal from bash
    if (addressArg) patchData.address = addressArg.replace(/^"|"$/g, '');
    if (urlArg) patchData.website_url = urlArg.replace(/^"|"$/g, '');
    if (tzArg) patchData.timezone = tzArg.replace(/^"|"$/g, '');
    if (coordArg) patchData.coordinates = coordArg.replace(/^"|"$/g, '');

    const success = updateVenueMetadata(updateVenueId, patchData);
    if (success) {
      console.log(`Successfully updated ${updateVenueId}`);
      console.log(JSON.stringify(getVenueDetails(updateVenueId), null, 2));
    } else {
      console.error(`Failed to update ${updateVenueId} (No changes made or venue not found)`);
    }
    break;
  default:
    console.error('Usage: tsx brand-admin.ts [health|venues|events|event <id>|venue <id>|update-venue <id>]');
}
