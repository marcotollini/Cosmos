import QueryInterface from '../QueryInterface';

type returnType = {[key: string]: any} | undefined;

interface QueryGet extends QueryInterface {
  id: string;
  execute(): Promise<returnType>;
}
export default QueryGet;
export {returnType};
