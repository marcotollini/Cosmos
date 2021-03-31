import Database from './Database';
import create_slonik from './slonik';

import PG from './pg/PGDatabase';

let db: Database | undefined = undefined;

if (process.env.DBCLIENT === 'pg') {
  const slonik = create_slonik();
  db = new PG(slonik);
} else {
  throw 'DBCLIENT not found in env';
}

db.getEventsCount(1617193439, 1617194439, 60).then(x => console.log(x));

export default db;
