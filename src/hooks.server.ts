import type {Handle} from '@sveltejs/kit';
import Database from 'better-sqlite3';
import fs from 'fs';

function setupDB() {
    console.log("Initializing DB...");
    if (import.meta.env.VITE_DROP_DB) {
        console.log("Dropping DB as VITE_DROP_DB is set...")
        const fileNames = ['foobar.db', 'foobar.db-shm', 'foobar.db-wal'];

        fileNames.forEach((fileName) => {
            fs.unlink(fileName, (err: NodeJS.ErrnoException | null) => {
                console.log(`Coudln't delete ${fileName}`)
            });
        });
    }

    const db = new Database('foobar.db', { verbose: console.log });
    // db.pragma('journal_mode = WAL');


    db.prepare(`CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      date TEXT,
      options INTEGER
    )`).run();

    db.prepare(`CREATE TABLE IF NOT EXISTS articles (
      id TEXT PRIMARY KEY,
      name TEXT,
      price REAL,
      category INTEGER
    )
    `).run();

    db.prepare(`CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      transaction_id TEXT,
      article_id TEXT,
      quantity INTEGER,
      FOREIGN KEY (transaction_id) REFERENCES transactions(id),
      FOREIGN KEY (article_id) REFERENCES articles(id)
    )`).run();
    return db;
}

const db = setupDB();

export const handle = (async ({ event, resolve }) => {
    event.locals = { db };
    return await resolve(event);
}) satisfies Handle;
