import QueryInterface from '../../QueryInterface';

type returnType = (string | number | boolean | null)[];

interface FilterFieldValues extends QueryInterface {
  bmpstate: any;
  fieldName: string;
  execute(): Promise<returnType>;
}
export default FilterFieldValues;
export {returnType};
