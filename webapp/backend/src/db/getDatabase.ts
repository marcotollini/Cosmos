import Database from './Database';
import create_knex from './knex';

import PG from './pg/PGDatabase';

let db: Database | undefined = undefined;

if (process.env.DBCLIENT === 'pg') {
  const knex = create_knex();
  db = new PG(knex);
} else {
  throw 'No DBCLIENT FOUND';
}

export default db;
