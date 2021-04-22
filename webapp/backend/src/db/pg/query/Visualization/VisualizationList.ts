import {sql} from 'slonik';

import {default as Query, slonikSql} from '../../Query';
import {
  default as VisualizationListInterface,
  returnType,
} from '../../../query-interface/Visualization/VisualizationList';

type queryReturnType = Record<string, unknown>[];

class VisualizationList extends Query implements VisualizationListInterface {
  bmpstate: slonikSql;
  show: string[];
  constructor(bmpstate: slonikSql, show: string[]) {
    super();
    this.bmpstate = bmpstate;
    this.show = show;
  }

  raw() {
    return sql`
      SELECT DISTINCT ${sql.join(
        this.show.map(x => sql.identifier([x])),
        sql`, `
      )}
      FROM (${this.bmpstate}) as bmpstate
      LIMIT 101
    `;
  }

  async execute(): Promise<returnType> {
    const rows = (await this.executeQuery()) as queryReturnType;
    return rows;
  }
}

export default VisualizationList;
export {returnType, queryReturnType};
