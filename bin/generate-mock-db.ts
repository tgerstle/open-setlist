import Database from 'better-sqlite3';
import { readFileSync, existsSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { program } from 'commander';
import prompts from 'prompts';
import { faker } from '@faker-js/faker';

program
    .option('-v, --venues <count>', 'Number of venues to generate')
    .option('-s, --shows <count>', 'Number of shows to generate per venue')
    .parse(process.argv);

const getAnswers = async () => {
    const options = program.opts();

    if (options.venues && options.shows) {
        return {
            venues: parseInt(options.venues, 10),
            shows: parseInt(options.shows, 10),
        };
    }

    let response;

    // Skip prompts if running non-interactively or args provided
    if (options.venues && options.shows) {
        response = {
            venues: parseInt(options.venues, 10),
            shows: parseInt(options.shows, 10)
        };
    } else {
        response = await prompts([
            {
                type: 'number',
                name: 'venues',
                message: 'How many mock venues would you like to generate?',
                initial: options.venues ? parseInt(options.venues, 10) : 5,
                min: 1
            },
            {
                type: 'number',
                name: 'shows',
                message: 'How many scheduled shows per venue?',
                initial: options.shows ? parseInt(options.shows, 10) : 10,
                min: 0
            }
        ]);

        if (response.venues === undefined || response.shows === undefined) {
            console.log('Process canceled.');
            // Provide silent fallback for scripting
            response = { venues: 5, shows: 10 };
        }
    }

    return response;
};

const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const main = async () => {
    const { venues: numVenues, shows: numShowsPerVenue } = await getAnswers();

    const dbPath = join(process.cwd(), 'data', 'demo.db');

    if (existsSync(dbPath)) {
        console.log(`Removing existing demo database at ${dbPath}...`);
        unlinkSync(dbPath);
    }

    console.log(`Creating fresh demo database at ${dbPath}...`);
    const db = new Database(dbPath);

    // Initialize schema
    const schemaPath = join(process.cwd(), 'src', 'db', 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf8');
    db.exec(schema);

    console.log(`Generating ${numVenues} venues...`);
    const insertVenue = db.prepare(`
    INSERT INTO venues (id, name, address, website_url, scraper_type, latitude, longitude, neighborhood, short_name, theme_color)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

    const insertShow = db.prepare(`
    INSERT INTO shows (id, venue_id, artist_name, event_date, event_time, ticket_url, is_sold_out, is_canceled, enrichment_status, doors_time, price, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

    const insertArtistMeta = db.prepare(`
    INSERT INTO artists_metadata (artist_name, genres, is_local)
    VALUES (?, ?, ?)
  `);

    let totalShows = 0;

    const THEME_COLORS = [
        'red',
        'orange',
        'stone',
        'green',
        'teal',
        'cyan',
        'blue',
        'indigo',
        'violet',
        'purple',
        'fuchsia',
        'rose',
    ];

    db.transaction(() => {
        for (let i = 0; i < numVenues; i++) {
            const venueName = faker.company.name() + ' Theater';
            const venueId = generateSlug(venueName);
            const shortName = venueName.split(' ').map(w => w[0]).join('').substring(0, 3).toUpperCase();
            const themeColor = faker.helpers.arrayElement(THEME_COLORS);

            insertVenue.run(
                venueId,
                venueName,
                faker.location.streetAddress() + ', ' + faker.location.city() + ', ' + faker.location.state({ abbreviated: true }),
                faker.internet.url(),
                'mock',
                faker.location.latitude({ max: 45.0, min: 35.0 }),
                faker.location.longitude({ max: -80.0, min: -100.0 }),
                faker.location.county(),
                shortName,
                themeColor
            );

            for (let j = 0; j < numShowsPerVenue; j++) {
                const isLocal = faker.datatype.boolean({ probability: 0.3 });
                const artistName = isLocal ? 'The ' + faker.commerce.productMaterial() + 's' : faker.person.fullName();

                // Random date within next 60 days
                const eventDate = faker.date.soon({ days: 60 });
                const dateStr = eventDate.toISOString().split('T')[0];
                const timeStr = faker.helpers.arrayElement(['19:00', '20:00', '21:00', '18:30']);
                // Add a random string to ID to prevent occasional collisions
                const id = venueId + '-' + generateSlug(artistName) + '-' + dateStr + '-' + faker.string.alphanumeric(4);

                const isSoldOut = faker.datatype.boolean({ probability: 0.1 });
                const isCanceled = faker.datatype.boolean({ probability: 0.05 });

                insertShow.run(
                    id,
                    venueId,
                    artistName,
                    dateStr,
                    timeStr,
                    faker.internet.url(),
                    isSoldOut ? 1 : 0,
                    isCanceled ? 1 : 0,
                    'done', // mock data doesn't need enrichment
                    timeStr, // mock doors time
                    faker.commerce.price({ min: 10, max: 150, symbol: '$', dec: 0 }),
                    faker.lorem.paragraph()
                );

                // Add artist metadata
                try {
                    insertArtistMeta.run(
                        artistName,
                        JSON.stringify([faker.music.genre(), faker.music.genre()]),
                        isLocal ? 1 : 0
                    );
                } catch (e: any) {
                    // Ignore UNIQUE constraint if same artist generated
                    if (!e.message.includes('UNIQUE constraint failed')) throw e;
                }

                totalShows++;
            }
        }
    })();

    console.log('\\n✅ Successfully generated ' + numVenues + ' venues and ' + totalShows + ' shows!');
    console.log('Demo DB is located at: ' + dbPath);
    console.log('\\nTo use it, run the frontend with PUBLIC_DEMO=true:');
    console.log('cross-env PUBLIC_DEMO=true npm run dev --prefix astro-app');
};

main().catch(console.error);
