import {UndirectedGraph} from 'graphology';
import Viewport from './Viewport';
import {Graphics} from './View/pixi';
import Generator from './View/Generator';

import {GraphOptions, Attributes} from 'graphology-types';

class Graph extends UndirectedGraph {
  viewport: Viewport;
  generator: Generator;
  _graphicNodes: Record<string, Graphics>;
  _graphicEdges: Record<string, Graphics>;

  constructor(viewport: Viewport, options?: GraphOptions<Attributes>) {
    if (options !== undefined) {
      if (options.allowSelfLoops === true) {
        throw new Error('allowSelfLoops not yet supported');
      }
    }

    super(options);

    this.viewport = viewport;
    this.generator = new Generator();
    this._graphicNodes = {};
    this._graphicEdges = {};

    this.viewport.sortableChildren = true;

    this.on('nodeAdded', this.handlerNodeAdd);
    this.on('nodeDropped', this.handlerNodeDelete);
    this.on('edgeAdded', this.handlerEdgeAdd);
    this.on('edgeDropped', this.handlerEdgeDelete);
    this.on('cleared', this.handlerCleared);
    this.on('edgesCleared', this.handlerEdgesCleared);
    this.on('nodeAttributesUpdated', this.handlerNodeAttributesUpdated);
    this.on('edgeAttributesUpdated', this.handlerEdgeAttributesUpdated);
  }

  handlerNodeAdd(payload: {key: string; attributes: Attributes}) {
    const node = this.generator.node(payload.key, payload.attributes);
    this._graphicNodes[payload.key] = node;
    node.visible = true;
    this.viewport.addChild(node);
  }

  handlerNodeDelete(payload: {key: string; attributes: Attributes}) {
    const node = this._graphicNodes[payload.key];
    this.viewport.removeChild(node);
  }

  handlerEdgeAdd(payload: {
    key: string;
    source: string;
    target: string;
    attributes: Attributes;
    undirected: boolean;
  }) {
    const fromAttr = this.getNodeAttributes(payload.source);
    const toAttr = this.getNodeAttributes(payload.target);

    payload.attributes.fromx = fromAttr.x;
    payload.attributes.fromy = fromAttr.y;
    payload.attributes.tox = toAttr.x;
    payload.attributes.toy = toAttr.y;

    const edge = this.generator.edge(payload.key, payload.attributes);
    this._graphicEdges[payload.key] = edge;
    this.viewport.addChild(edge);
  }

  handlerEdgeDelete(payload: {
    key: string;
    source: string;
    target: string;
    attributes: Attributes;
    undirected: boolean;
  }) {
    const edge = this._graphicEdges[payload.key];
    this.viewport.removeChild(edge);
  }

  handlerCleared() {
    this._graphicEdges = {};
    this._graphicNodes = {};
  }

  handlerEdgesCleared() {
    this._graphicEdges = {};
  }

  handlerNodeAttributesUpdated(payload: {
    type: string;
    key: string;
    attributes: Attributes;
    name: string;
    data: Attributes;
  }) {
    const node = this._graphicNodes[payload.key];
    let changed = false;
    if (payload.attributes.x) {
      node.x = payload.attributes.x;
      changed = true;
    }
    if (payload.attributes.y) {
      node.y = payload.attributes.y;
      changed = true;
    }

    if (changed) {
      this.forEachUndirectedEdge(
        payload.key,
        (key, attributes, source, target) => {
          if (payload.key === source) {
            this.mergeEdgeAttributes(key, {
              fromx: payload.attributes.x,
              fromy: payload.attributes.y,
              color: payload.attributes.color,
            });
          } else {
            this.mergeEdgeAttributes(key, {
              tox: payload.attributes.x,
              toy: payload.attributes.y,
              color: payload.attributes.color,
            });
          }
        }
      );
    }
  }

  handlerEdgeAttributesUpdated(payload: {
    type: string;
    key: string;
    attributes: Attributes;
    name: string;
    data: Attributes;
  }) {
    const edge = this._graphicEdges[payload.key];
    this.viewport.removeChild(edge);

    const newedge = this.generator.edge(payload.key, payload.attributes);
    this._graphicEdges[payload.key] = newedge;
    this.viewport.addChild(newedge);
  }
}

export default Graph;
