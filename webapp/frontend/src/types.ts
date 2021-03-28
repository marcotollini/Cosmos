interface CytoNode {
  id: string;
  label: string;
  color: string | number;
  radius: number;
  display: boolean;
}

interface CytoEdge {
  id: string;
  src: string;
  dst: string;
  color: string | number;
  width: number;
}

interface CytoGraph {
  nodes: {
    [key: string]: CytoNode;
  };
  edges: {
    [key: string]: CytoEdge;
  };
  type: 'load' | 'filter';
}

export {CytoGraph, CytoNode, CytoEdge};
