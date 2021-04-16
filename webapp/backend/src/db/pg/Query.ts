import QueryInterface from '../QueryInterface';
import create_slonik from './slonik';

import {DatabasePoolType, DatabasePoolConnectionType, sql} from 'slonik';

const pool = create_slonik();

class Query extends QueryInterface {
  pool: DatabasePoolType;
  constructor() {
    super();
    this.pool = pool;
  }

  async getPid(connection: DatabasePoolConnectionType) {
    return (await connection.oneFirst(sql`SELECT pg_backend_pid()`)) as number;
  }

  async cancelPid(pid: number) {
    // error instanceof StatementCancelledError
    await this.pool.query(sql`SELECT pg_cancel_backend(${pid})`);
  }
}

export default Query;
