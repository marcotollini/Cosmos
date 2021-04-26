import QueryInterface from '../../QueryInterface';

type returnType = {
  local_bmp_router: string;
  local_rd: string;
  local_ip: string;
  peer_bmp_router: string;
  peer_rd: string;
  peer_ip: string;
}[];

interface VisualizationPeeringTopology extends QueryInterface {
  bmpstate: any;
  execute(): Promise<returnType>;
}
export default VisualizationPeeringTopology;
export {returnType};
