interface QueryInterface {
  timeBetweenDumps: number;

  raw(): any;
  execute(): Promise<unknown>;

  cancel(): Promise<boolean>;
}
export default QueryInterface;
