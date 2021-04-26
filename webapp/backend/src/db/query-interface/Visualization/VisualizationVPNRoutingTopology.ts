import QueryInterface from '../../QueryInterface';

type returnType = {
  src_bmp_router: string;
  src_rd: string;
  dst_bmp_router: string;
  dst_rd: string;
}[];

interface VisualizationVPNRoutingTopology extends QueryInterface {
  bmpstate: any;
  execute(): Promise<returnType>;
}
export default VisualizationVPNRoutingTopology;
export {returnType};
