import {
  sql,
  TaggedTemplateLiteralInvocationType,
  QueryResultRowType,
} from 'slonik';

import Query from '../Query';

type queryReturnType = {
  bmp_router: string;
  rd: string;
}[];

type returnType = queryReturnType;

class VisualizationVPNTopology extends Query {
  bmpstate: TaggedTemplateLiteralInvocationType<QueryResultRowType>;
  constructor(
    bmpstate: TaggedTemplateLiteralInvocationType<QueryResultRowType>
  ) {
    super();
    this.bmpstate = bmpstate;
  }

  raw() {
    return sql`
      SELECT DISTINCT bmp_router, rd
      FROM (${this.bmpstate}) as bmpstate
      WHERE rd IS NOT NULL
    `;
  }

  async execute(): Promise<returnType> {
    const rows = (await this.executeQuery()) as queryReturnType;
    return rows;
  }
}

export default VisualizationVPNTopology;
export {returnType, queryReturnType};
