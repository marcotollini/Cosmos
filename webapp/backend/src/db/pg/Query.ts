import create_slonik from './slonik';

import {
  DatabasePoolType,
  DatabasePoolConnectionType,
  sql,
  QueryResultRowType,
  TaggedTemplateLiteralInvocationType,
} from 'slonik';

type slonikSql = TaggedTemplateLiteralInvocationType<QueryResultRowType>;

const pool = create_slonik();

abstract class Query {
  pool: DatabasePoolType;
  pid: null | number;
  timeBetweenDumps: number;

  constructor() {
    this.pool = pool;
    this.pid = null;
    this.timeBetweenDumps = 45 * 60;
  }

  abstract raw(): slonikSql;

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
export {slonikSql};
