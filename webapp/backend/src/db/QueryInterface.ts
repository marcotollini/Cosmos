class QueryInterface {
  timeBetweenDumps: number;
  constructor() {
    this.timeBetweenDumps = 45 * 60;
  }

  async execute(): Promise<unknown> {
    throw new TypeError('Please implement abstract method.');
  }

  async cancel(): Promise<boolean> {
    throw new TypeError('Please implement abstract method.');
  }
}
export default QueryInterface;
