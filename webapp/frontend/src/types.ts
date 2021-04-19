interface CytoNode {
  id: string;
  label: string;
  color?: string;
  size?: number;
  visible?: boolean;
  children?: string[];
}

interface CytoEdge {
  id: string;
  src: string;
  dst: string;
  color?: string;
  size?: number;
  visible?: boolean;
}

interface CytoGraph {
  nodes: {
    [key: string]: CytoNode;
  };
  edges: {
    [key: string]: CytoEdge;
  };
}

interface CytoNodeDefaults {
  id: string;
  label: string;
  color: string;
  size: number;
  visible: boolean;
  children: string[];
}

interface CytoEdgeDefaults {
  id: string;
  src: string;
  dst: string;
  color: string;
  size: number;
  visible: boolean;
}

interface CytoGraphDefaults {
  nodes: {
    [key: string]: CytoNodeDefaults;
  };
  edges: {
    [key: string]: CytoEdgeDefaults;
  };
}

export {
  CytoNodeDefaults,
  CytoEdgeDefaults,
  CytoGraphDefaults,
  CytoNode,
  CytoEdge,
  CytoGraph,
};
