import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import Database from 'better-sqlite3';
import { join } from 'node:path';
import { appendFileSync } from 'node:fs';

const THEME_COLORS = ['blue', 'sky', 'fuchsia', 'orange', 'red', 'amber', 'indigo', 'slate', 'purple', 'emerald', 'teal', 'pink', 'lime', 'cyan', 'yellow', 'zinc'];

async function run() {
    const rl = createInterface({ input, output });

    const name = await rl.question('Venue Full Name: ');
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const shortName = await rl.question('Short Name (optional): ');
    const color = await rl.question(`Theme Color (${THEME_COLORS.join(', ')}): `);

    if (!THEME_COLORS.includes(color)) {
        console.error('Invalid color selection.');
        process.exit(1);
    }

    // Add to active database
    const dbPath = process.env.DATABASE_PATH || join(process.cwd(), 'data', 'mkesetlist.db');
    const db = new Database(dbPath);

    db.prepare(`
    INSERT INTO venues (id, name, short_name, theme_color) 
    VALUES (?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET name=excluded.name, short_name=excluded.short_name, theme_color=excluded.theme_color
  `).run(id, name, shortName || null, color);

    console.log(`Successfully added ${name} to the DB!`);

    // Optionally, automatically append to seed.sql for version control
    const seedString = `\nINSERT INTO venues (id, name, short_name, theme_color) VALUES ('${id}', '${name}', ${shortName ? `'${shortName}'` : 'NULL'}, '${color}');`;
    appendFileSync(join(process.cwd(), 'src', 'db', 'seed.sql'), seedString);

    rl.close();
}

run();
