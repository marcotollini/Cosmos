import Database from './DatabaseInterface';

import PG from './pg/Database';

let db: Database;

if (process.env.DBCLIENT === 'pg') {
  db = new PG();
} else {
  throw 'DBCLIENT not found in env';
}

export default db;
