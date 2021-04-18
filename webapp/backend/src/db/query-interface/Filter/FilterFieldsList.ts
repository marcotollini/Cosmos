import QueryInterface from '../../QueryInterface';

type returnType = string[];

interface FilterFieldsList extends QueryInterface {
  bmpstate: any;
  execute(): Promise<returnType>;
}
export default FilterFieldsList;
export {returnType};
