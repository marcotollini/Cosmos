import QueryInterface from '../../QueryInterface';

type returnType = (string | number | boolean | null)[];

interface FilterFieldsValues extends QueryInterface {
  bmpstate: any;
  execute(): Promise<returnType>;
}
export default FilterFieldsValues;
export {returnType};
