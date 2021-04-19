import QueryInterface from '../../QueryInterface';

type returnType = string[];

interface FilterBMPState extends QueryInterface {
  bmpstate: any;
  execute(): Promise<returnType>;
}
export default FilterBMPState;
export {returnType};
