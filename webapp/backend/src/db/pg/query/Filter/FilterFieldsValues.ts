import {sql} from 'slonik';

import {default as Query, slonikSql} from '../../Query';
import {
  default as FilterFieldsValuesInterface,
  returnType,
} from '../../../query-interface/Filter/FilterFieldsValues';

type queryReturnType = {
  key: string;
  values: (string | number | boolean | null)[];
}[];

class FilterFieldValues extends Query implements FilterFieldsValuesInterface {
  bmpstate: slonikSql;
  constructor(bmpstate: slonikSql) {
    super();
    this.bmpstate = bmpstate;
  }

  // https://stackoverflow.com/questions/41130773/how-can-i-get-the-distinct-values-of-all-columns-in-a-single-table-in-postgres
  raw() {
    return sql`
    SELECT *
    FROM(
      SELECT key, json_agg(DISTINCT value) as values
      FROM (${this.bmpstate}) as bmpstate, jsonb_each(to_jsonb(bmpstate))
      GROUP BY key
    ) AS k
    WHERE key != ${'timestamp_arrival'}
    AND key != ${'timestamp_database'}
    AND key != ${'timestamp'}
    AND key != ${'seq'}
    ORDER BY key
    `;
  }

  async execute(): Promise<returnType> {
    const rows = (await this.executeQuery()) as queryReturnType;
    return rows;
  }
}

export default FilterFieldValues;
export {returnType, queryReturnType};
