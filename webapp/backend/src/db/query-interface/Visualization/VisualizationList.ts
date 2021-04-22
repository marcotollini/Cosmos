import QueryInterface from '../../QueryInterface';

type returnType = Record<string, any>[];

interface VisualizationList extends QueryInterface {
  bmpstate: any;
  show: string[];
  execute(): Promise<returnType>;
}
export default VisualizationList;
export {returnType};
