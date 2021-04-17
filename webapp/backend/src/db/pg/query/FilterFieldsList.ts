import {
  sql,
  TaggedTemplateLiteralInvocationType,
  QueryResultRowType,
} from 'slonik';

import Query from '../Query';

class FilterFieldsList extends Query {
  bmpstate: TaggedTemplateLiteralInvocationType<QueryResultRowType>;
  constructor(
    bmpstate: TaggedTemplateLiteralInvocationType<QueryResultRowType>
  ) {
    super();
    this.bmpstate = bmpstate;
  }

  // https://stackoverflow.com/questions/41130773/how-can-i-get-the-distinct-values-of-all-columns-in-a-single-table-in-postgres
  raw() {
    return sql`
    SELECT *
    FROM(
      SELECT key
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

  async execute(): Promise<string[]> {
    const rows = (await this.executeQuery()) as {key: string}[];

    const fieldList = rows.map(x => x.key);
    return fieldList;
  }
}

export default FilterFieldsList;
