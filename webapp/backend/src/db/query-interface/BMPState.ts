import QueryInterface from '../QueryInterface';

type returnType = Record<string, unknown>[];

interface BMPState extends QueryInterface {
  timestamp: Date;
  vpn: string;
  execute(): Promise<returnType>;
}
export default BMPState;
export {returnType};
