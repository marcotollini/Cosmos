import {TaggedTemplateLiteralInvocationType, QueryResultRowType} from 'slonik';

class QueryInterface {
  timeBetweenDumps: number;
  constructor() {
    this.timeBetweenDumps = 45 * 60;
  }

  raw(): TaggedTemplateLiteralInvocationType<QueryResultRowType> {
    throw new TypeError('Please implement abstract method.');
  }

  async execute(): Promise<unknown> {
    throw new TypeError('Please implement abstract method.');
  }

  async cancel(): Promise<boolean> {
    throw new TypeError('Please implement abstract method.');
  }
}
export default QueryInterface;
