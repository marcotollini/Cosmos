import {sql} from 'slonik';

import {default as Query, slonikSql} from '../../Query';
import {
  default as FilterFieldValuesInterface,
  returnType,
} from '../../../query-interface/Filter/FilterFieldValues';

type queryReturnType = {
  values: string | number | boolean | null;
}[];

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
    const identifier = sql.identifier([this.fieldName]);
    const selection =
      this.schema.event[this.fieldName].data_type !== 'jsonb'
        ? sql`${identifier}`
        : sql`jsonb_array_elements(${identifier})`;

    return sql`
      SELECT DISTINCT ${selection} AS values
      FROM (${this.bmpstate}) as state
    `;
  }

  async execute(): Promise<returnType> {
    const rows = (await this.executeQuery()) as queryReturnType;
    return rows.map(x => x.values);
  }
}

export default FilterFieldsValues;
export {returnType, queryReturnType};
