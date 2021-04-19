import QueryInterface from '../../QueryInterface';

type returnType = string[];
type filtersType = Record<string, (string | number | boolean | null)[]>;

interface FilterFieldsList extends QueryInterface {
  bmpstate: any;
  filters: Record<string, (string | number | boolean | null)[]>;
  execute(): Promise<returnType>;
}
export default FilterFieldsList;
export {returnType, filtersType};
