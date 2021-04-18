import {sql} from 'slonik';

import {default as Query, slonikSql} from '../../Query';
import {
  default as FilterFieldValuesInterface,
  returnType,
} from '../../../query-interface/Filter/FilterFieldValues';

type queryReturnType = returnType;

class FilterFieldsValues extends Query implements FilterFieldValuesInterface {
  bmpstate: slonikSql;
  fieldName: string;
  constructor(bmpstate: slonikSql, fieldName: string) {
    super();
    this.bmpstate = bmpstate;
    this.fieldName = fieldName;
  }

  // https://stackoverflow.com/questions/41130773/how-can-i-get-the-distinct-values-of-all-columns-in-a-single-table-in-postgres
  raw() {
    return sql`
      SELECT key, json_agg(DISTINCT value) as values
      FROM (${this.bmpstate}) as bmpstate, jsonb_each(to_jsonb(bmpstate))
      WHERE key = ${this.fieldName}
      GROUP BY key
    `;
  }

  async execute(): Promise<returnType> {
    const rows = (await this.executeQuery()) as queryReturnType;
    return rows;
  }
}

export default FilterFieldsValues;
export {returnType, queryReturnType};
