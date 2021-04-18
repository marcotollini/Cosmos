import QueryInterface from '../QueryInterface';

type returnType = string[];

interface VPNList extends QueryInterface {
  timestamp: Date;
  execute(): Promise<returnType>;
}
export default VPNList;
export {returnType};
