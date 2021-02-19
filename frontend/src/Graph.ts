import {Graphics} from 'pixi.js';
import {UndirectedGraph} from 'graphology';
import {GraphOptions, Attributes} from 'graphology-types';
import * as _ from 'underscore';

import Viewport from './Viewport';
import {
  default as Factory,
  DEFAULT_NODE,
  DEFAULT_EDGE,
  Point,
} from './GraphComponents/Factory';

class Graph extends UndirectedGraph {
  viewport: Viewport;
  nodesStore: Record<string, Graphics>;
  edgesStore: Record<string, Graphics>;

  constructor(viewport: Viewport, options?: GraphOptions<Attributes>) {
    if (options !== undefined) {
      if (options.allowSelfLoops === true) {
        throw new Error('allowSelfLoops not yet supported');
      }
    }

    super(options);

    this.viewport = viewport;

    this.nodesStore = {};
    this.edgesStore = {};

    const burstCB = _.partial(this.viewport.tickerManager.burst, 500).bind(
      this.viewport.tickerManager
    );
    this.on('nodeAdded', this.handlerNodeAdd);
    this.on('nodeAdded', burstCB);
    this.on('nodeDropped', this.handlerNodeDelete);
    this.on('nodeDropped', burstCB);
    this.on('edgeAdded', this.handlerEdgeAdd);
    this.on('edgeAdded', burstCB);
    this.on('edgeDropped', this.handlerEdgeDelete);
    this.on('edgeDropped', burstCB);
    this.on('cleared', this.handlerCleared);
    this.on('cleared', burstCB);
    this.on('edgesCleared', this.handlerEdgesCleared);
    this.on('edgesCleared', burstCB);
    this.on('nodesCleared', this.handlerNodesCleared);
    this.on('nodesCleared', burstCB);
    this.on('nodeAttributesUpdated', this.handlerNodeAttributesUpdated);
    this.on('nodeAttributesUpdated', burstCB);
    this.on('edgeAttributesUpdated', this.handlerEdgeAttributesUpdated);
    this.on('edgeAttributesUpdated', burstCB);
  }

  getNode(key: string) {
    return this.nodesStore[key];
  }

  getEdge(key: string) {
    return this.edgesStore[key];
  }

  handlerNodeAdd(payload: {key: string; attributes: Attributes}) {
    payload.attributes.name = payload.key;
    const options = _.defaults(payload.attributes, DEFAULT_NODE);
    const node = Factory.node();
    Factory.updateGraphic(node, options);

    this.nodesStore[payload.key] = node;

    this.viewport.addChild(node);
  }

  handlerNodeDelete(payload: {key: string; attributes: Attributes}) {
    const node = this.nodesStore[payload.key];
    this.viewport.removeChild(node);
    delete this.nodesStore[payload.key];
  }

  handlerEdgeAdd(payload: {
    key: string;
    source: string;
    target: string;
    attributes: Attributes;
    undirected: boolean;
  }) {
    const fromAttr = this.getNodeAttributes(payload.source);
    const fromPoint: Point = {x: fromAttr.x, y: fromAttr.y};
    const toAttr = this.getNodeAttributes(payload.target);
    const toPoint: Point = {x: toAttr.x, y: toAttr.y};

    payload.attributes.name = payload.key;
    payload.attributes.x = fromPoint.x;
    payload.attributes.y = fromPoint.y;
    payload.attributes.width = Factory.pythagoreanTheorem(fromPoint, toPoint);
    payload.attributes.rotation = Factory.edgeRotation(fromPoint, toPoint);

    const options = _.defaults(payload.attributes, DEFAULT_EDGE);

    const edge = Factory.edge();
    Factory.updateGraphic(edge, options);

    this.edgesStore[payload.key] = edge;
    this.viewport.addChild(edge);
  }

  handlerEdgeDelete(payload: {
    key: string;
    source: string;
    target: string;
    attributes: Attributes;
    undirected: boolean;
  }) {
    const edge = this.edgesStore[payload.key];
    this.viewport.removeChild(edge);
    delete this.edgesStore[payload.key];
  }

  handlerCleared() {
    this.handlerNodesCleared();
    this.handlerEdgesCleared();
  }

  handlerNodesCleared() {
    for (const node in this.nodesStore) {
      this.dropNode(node);
    }
  }

  handlerEdgesCleared() {
    for (const edge in this.edgesStore) {
      this.dropEdge(edge);
    }
  }

  handlerNodeAttributesUpdated(payload: {
    type: string;
    key: string;
    attributes: Attributes;
    name: string;
    data: Attributes;
  }) {
    const node = this.nodesStore[payload.key];
    const oldPosition = payload.attributes;

    Factory.updateGraphic(node, payload.attributes);

    if (node.x !== oldPosition.x || node.y !== oldPosition.y) {
      this.forEachUndirectedEdge(
        payload.key,
        (key, attributes, source, target) => {
          const srcAttr = this.getNodeAttributes(source);
          const srcPoint = {x: srcAttr.x, y: srcAttr.y};
          const dstAttr = this.getNodeAttributes(target);
          const dstPoint = {x: dstAttr.x, y: dstAttr.y};
          this.mergeEdgeAttributes(key, {
            x: srcAttr.x,
            y: srcAttr.y,
            width: Factory.pythagoreanTheorem(srcPoint, dstPoint),
            rotation: Factory.edgeRotation(srcPoint, dstPoint),
          });
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
    const edge = this.edgesStore[payload.key];
    Factory.updateGraphic(edge, payload.attributes);
  }
}

export default Graph;
