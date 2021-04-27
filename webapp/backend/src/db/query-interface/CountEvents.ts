import QueryInterface from '../QueryInterface';

type returnType = {
  start_bucket: number;
  count: number;
}[];

interface CountEvents extends QueryInterface {
  timestamp: Date;
  vpn: string;
  filters: Record<string, (string | number | boolean | null)[]>;
  approximation: boolean;
  execute(): Promise<returnType>;
}
export default CountEvents;
export {returnType};
