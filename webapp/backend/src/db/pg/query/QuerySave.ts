import {sql} from 'slonik';

import {default as Query, slonikSql} from '../Query';
import {
  default as QuerySaveInterface,
  returnType,
} from '../../query-interface/QuerySave';

type queryReturnType = {id: string}[];

class QuerySave extends Query implements QuerySaveInterface {
  payload: {[key: string]: any};
  constructor(payload: {[key: string]: any}) {
    super();
    this.payload = payload;
  }

  raw() {
    return sql`
      INSERT INTO queries(payload)
      VALUES(${sql.json(this.payload)})
      RETURNING id
    `;
  }

  async execute(): Promise<returnType> {
    const rows = (await this.executeQuery()) as queryReturnType;
    return rows[0].id;
  }
}

export default QuerySave;
export {returnType, queryReturnType};
