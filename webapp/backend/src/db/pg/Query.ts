import QueryInterface from '../QueryInterface';
import create_slonik from './slonik';

import {
  DatabasePoolType,
  DatabasePoolConnectionType,
  sql,
  QueryResultRowType,
} from 'slonik';

const pool = create_slonik();

class Query extends QueryInterface {
  pool: DatabasePoolType;
  pid: null | number;
  constructor() {
    super();
    this.pool = pool;
    this.pid = null;
  }

  async getPid(connection: DatabasePoolConnectionType) {
    return (await connection.oneFirst(sql`SELECT pg_backend_pid()`)) as number;
  }

  async cancelPid(pid: number) {
    // error instanceof StatementCancelledError
    await this.pool.query(sql`SELECT pg_cancel_backend(${pid})`);
  }

  async executeQuery(): Promise<readonly QueryResultRowType[]> {
    const request = this.pool.connect(async connection => {
      this.pid = await this.getPid(connection);
      return connection.query(this.raw());
    });

    try {
      const result = await request;
      const rows = result.rows;
      this.pid = null;
      return rows;
    } catch (e) {
      this.pid = null;
      throw e;
    }
  }

  async cancel() {
    if (this.pid !== null) {
      await this.cancelPid(this.pid);
      return true;
    }
    return false;
  }
}

export default Query;
