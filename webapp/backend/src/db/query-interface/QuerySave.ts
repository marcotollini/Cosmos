import QueryInterface from '../QueryInterface';

type returnType = string;

interface QuerySave extends QueryInterface {
  payload: {[key: string]: any};
  execute(): Promise<returnType>;
}
export default QuerySave;
export {returnType};
