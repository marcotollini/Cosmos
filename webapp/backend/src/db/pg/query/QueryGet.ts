import {sql} from 'slonik';

import {default as Query, slonikSql} from '../Query';
import {
  default as QueryGetInterface,
  returnType,
} from '../../query-interface/QueryGet';

type queryReturnType = {
  payload: {
    [key: string]: any;
  };
}[];
class QueryGet extends Query implements QueryGetInterface {
  id: string;
  constructor(id: string) {
    super();
    this.id = id;
  }

  raw() {
    return sql`
      SELECT payload
      FROM queries
      WHERE id = ${this.id}
    `;
  }

  async execute(): Promise<returnType> {
    const rows = ((await this.executeQuery()) as unknown) as queryReturnType;
    if (rows.length === 0) {
      return undefined;
    }
    return rows[0];
  }
}

export default QueryGet;
export {returnType, queryReturnType};
