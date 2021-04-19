import {sql} from 'slonik';

import {default as Query, slonikSql} from '../../Query';
import {
  default as FilterBMPStateInterface,
  returnType,
  filtersType,
} from '../../../query-interface/Filter/FilterBMPState';
import {isEmpty} from 'lodash';

type queryReturnType = {
  key: string;
}[];

class FilterBMPState extends Query implements FilterBMPStateInterface {
  bmpstate: slonikSql;
  filters: filtersType;
  constructor(bmpstate: slonikSql, filters: filtersType) {
    super();
    this.bmpstate = bmpstate;
    this.filters = filters;
  }

  // https://stackoverflow.com/questions/41130773/how-can-i-get-the-distinct-values-of-all-columns-in-a-single-table-in-postgres
  raw() {
    if (isEmpty(this.filters)) {
      return this.bmpstate;
    }

    const filtersSql = Object.keys(this.filters).map(fieldName => {
      const values = this.filters[fieldName];
      const hasNull = values.indexOf(null);

      if (hasNull !== -1) {
        values.splice(hasNull, 1);
      }
      const inQuery =
        values.length > 0
          ? sql`${sql.identifier([
              'bmpstatetofilter',
              fieldName,
            ])} IN (${sql.join(values, sql`, `)})`
          : sql``;

      const nullQuery = sql`${sql.identifier([
        'bmpstatetofilter',
        fieldName,
      ])} IS NULL`;

      if (values.length > 0 && hasNull !== -1) {
        return sql`(${inQuery} OR ${nullQuery})`;
      } else if (hasNull === -1) {
        return inQuery;
      } else {
        return nullQuery;
      }
    });

    return sql`
    SELECT *
    FROM(${this.bmpstate}) as bmpstatetofilter
    WHERE ${sql.join(filtersSql, sql` AND `)}
    `;
  }

  async execute(): Promise<returnType> {
    const rows = (await this.executeQuery()) as queryReturnType;

    const fieldList = rows.map(x => x.key);
    return fieldList;
  }
}

export default FilterBMPState;
export {returnType, queryReturnType, filtersType};

// sql`SELECT id FROM foo WHERE id = ANY(${sql.array([1, 2, 3])})`; <-
// sql`SELECT id FROM foo WHERE id != ALL(${sql.array([1, 2, 3], 'int4')})`;
