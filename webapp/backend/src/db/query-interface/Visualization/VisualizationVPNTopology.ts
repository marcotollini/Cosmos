import QueryInterface from '../../QueryInterface';

type returnType = {
  bmp_router: string;
  rd: string;
}[];

interface VisualizationVPNTopology extends QueryInterface {
  bmpstate: any;
  execute(): Promise<returnType>;
}
export default VisualizationVPNTopology;
export {returnType};
