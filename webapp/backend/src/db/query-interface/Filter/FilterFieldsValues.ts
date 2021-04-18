import QueryInterface from '../../QueryInterface';

type returnType = {
  key: string;
  values: (string | number | boolean | null)[];
}[];

interface FilterFieldsValues extends QueryInterface {
  bmpstate: any;
  execute(): Promise<returnType>;
}
export default FilterFieldsValues;
export {returnType};
