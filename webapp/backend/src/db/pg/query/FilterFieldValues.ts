import {
  sql,
  TaggedTemplateLiteralInvocationType,
  QueryResultRowType,
} from 'slonik';

import Query from '../Query';

type returnType = (string | number | boolean)[];

class FilterFieldValues extends Query {
  bmpstate: TaggedTemplateLiteralInvocationType<QueryResultRowType>;
  fieldName: string;
  constructor(
    bmpstate: TaggedTemplateLiteralInvocationType<QueryResultRowType>,
    fieldName: string
  ) {
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
    const rows = (await this.executeQuery()) as {
      key: string;
      values: returnType;
    }[];

    if (rows.length === 0) return [];
    const firstRow = rows[0];
    const values = firstRow.values;
    return values;
  }
}

export default FilterFieldValues;
export {returnType};
