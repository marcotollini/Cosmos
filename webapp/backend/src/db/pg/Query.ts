import create_slonik from './slonik';

import {
  DatabasePoolType,
  DatabasePoolConnectionType,
  sql,
  QueryResultRowType,
  TaggedTemplateLiteralInvocationType,
} from 'slonik';

import {default as get_schemas, schemas} from './schemas';

type slonikSql = TaggedTemplateLiteralInvocationType<QueryResultRowType>;

const pool = create_slonik();

const schema = {} as schemas;
get_schemas(pool, schema).then(x => {
  console.log('Schema loaded');
});

abstract class Query {
  pool: DatabasePoolType;
  pid: null | number;
  timeBetweenDumps: number;
  schema: schemas;

  constructor() {
    this.pool = pool;
    this.schema = schema;
    this.pid = null;
    this.timeBetweenDumps = 45 * 60 * 2;
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
