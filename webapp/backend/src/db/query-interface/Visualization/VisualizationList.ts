import QueryInterface from '../../QueryInterface';

type returnType = {
  bmp_router: string;
  rd: string;
  ip_prefix: string;
  bmp_nexthop: string;
  comms: string[];
}[];

interface VisualizationList extends QueryInterface {
  bmpstate: any;
  execute(): Promise<returnType>;
}
export default VisualizationList;
export {returnType};
