interface CytoNode {
  id: string;
  name: string;
  radius: number;
  color: string;
}

interface CytoEdge {
  id: string;
  width: number;
  color: string;
}

interface CytoGraph {
  nodes: CytoNode[];
  edges: CytoEdge[];;
}
export { CytoNode, CytoEdge, CytoGraph };

