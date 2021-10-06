import sqlite from 'sqlite3';
import { promisify } from 'util';
import { rm } from 'fs/promises';

let db = new sqlite.Database(':test_db:');

export async function runQuery(query) {
  let execute;
  if (query.includes('SELECT')) {
    execute = promisify(db.all).bind(db);
  } else {
    execute = promisify(db.run).bind(db);
  }

  const result = await execute(query);
  return result ?? [];
}

export async function cleanDb() {
  await rm(':test_db:');
  db = new sqlite.Database(':test_db:');
}
