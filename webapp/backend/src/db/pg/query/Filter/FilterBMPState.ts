import {sql, TypeNameIdentifierType} from 'slonik';

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

  anyFilter(fieldName: string, values: (string | number | boolean | null)[]) {
    if (values.length === 0) return sql``;
    const schema = this.schema.event[fieldName];
    const type = schema.udt_name;
    const identifier = sql`${sql.identifier(['bmpstatetofilter', fieldName])}`;

    if (type === 'jsonb' || type === 'json') {
      const searches = values.map(x => {
        return sql`${identifier} @> ${sql.json(x)}`;
      });
      return sql`(${sql.join(searches, sql` OR `)})`;
    }

    return sql`
      ${identifier} = ANY (${sql.array(values, type as TypeNameIdentifierType)})
    `;
  }

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

      const anyQuery = this.anyFilter(fieldName, values);

      const nullQuery = sql`${sql.identifier([
        'bmpstatetofilter',
        fieldName,
      ])} IS NULL`;

      if (values.length > 0 && hasNull !== -1) {
        return sql`(${anyQuery} OR ${nullQuery})`;
      } else if (hasNull === -1) {
        return anyQuery;
      } else {
        return nullQuery;
      }
    });

    console.log(sql`${sql.join(filtersSql, sql` AND `)}`);

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
