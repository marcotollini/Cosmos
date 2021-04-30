import QueryInterface from '../QueryInterface';

type returnType = Record<string, unknown>[];

interface PeerUpState extends QueryInterface {
  timestamp: Date;
  execute(): Promise<returnType>;
}
export default PeerUpState;
export {returnType};
