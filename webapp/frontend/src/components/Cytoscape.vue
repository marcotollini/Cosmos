<template>
  <div id="cytoscape"></div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import cytoscape, {NodeSingular} from 'cytoscape';
import _ from 'lodash';
import {CytoGraph, CytoEdgeReady, CytoNodeReady} from 'cosmos-lib/src/types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const colors = require('../colors.json');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const graphDefaults = require('../graph-defaults.json');

function edgeToCytoscape(edge: CytoEdgeReady, maxWidth: number) {
  return {
    id: edge.id,
    source: edge.src,
    target: edge.dst,
    width: Math.max(edge.width / maxWidth, 1),
    color: edge.color,
  };
}

export default defineComponent({
  name: 'Cytoscape',
  props: {
    graph: {},
  },
  data: () => ({
    cy: {} as cytoscape.Core,
    currentGraph: {} as CytoGraph,
  }),
  computed: {},
  watch: {
    async graph() {
      this.currentGraph = this.graph as CytoGraph;
      await this.draw();
    },
  },
  methods: {
    draw() {
      if (this.cy === undefined) return;
      const cy = this.cy;

      const graph = this.currentGraph;
      const type = graph.type;

      /* assign defaults to nodes and edges */
      const edges = _.mapValues(graph.edges, x => {
        return _.defaults(x, graphDefaults.edge);
      }) as Record<string, CytoEdgeReady>;

      const nodes = _.mapValues(graph.nodes, x => {
        return _.defaults(x, graphDefaults.node);
      }) as Record<string, CytoNodeReady>;

      /* assign colors */
      Object.keys(nodes).forEach(x => {
        const node = nodes[x];
        if (colors.node[node.color]) node.color = colors.node[node.color];
        if (colors.colors[node.color]) node.color = colors.colors[node.color];
      });

      Object.keys(edges).forEach(x => {
        const edge = edges[x];
        if (colors.edge[edge.color]) edge.color = colors.edge[edge.color];
        if (colors.colors[edge.color]) edge.color = colors.colors[edge.color];
      });

      /* assign colors */
      const maxWidth = Object.values(edges).reduce((prev, curr) => {
        return Math.max(prev, 2);
      }, 0);

      const oldNodes = this.cy.nodes().map(x => x.id());
      const oldNodesSet = new Set(oldNodes);

      const newNodes = Object.values(nodes).map(x => x.id);
      const newNodesSet = new Set(newNodes);

      const addNodes = newNodes.filter(x => !oldNodesSet.has(x));
      const [deleteNodes, updateNodes] = _.partition(
        oldNodes,
        x => !newNodesSet.has(x)
      );

      const oldEdges = this.cy.edges().map(x => x.id());
      const oldEdgesSet = new Set(oldEdges);

      const newEdges = Object.values(edges).map(x => x.id);
      const newEdgesSet = new Set(newEdges);

      const addEdges = newEdges.filter(x => !oldEdgesSet.has(x));
      const [deleteEdges, updateEdges] = _.partition(
        oldEdges,
        x => !newEdgesSet.has(x)
      );

      cy.startBatch();
      cy.add(
        addNodes.map(x => {
          const node = nodes[x];
          return {
            group: 'nodes',
            data: node,
            classes: node.visible ? '' : 'hidden',
          };
        })
      );

      deleteNodes.map(x => {
        if (type === 'load') {
          cy.remove(cy.$id(x));
        } else if (type === 'filter') {
          cy.$id(x).addClass('hidden');
        }
      });

      updateNodes.map(x => {
        const updateNode = nodes[x];
        const node = cy.$id(x);
        node.data(updateNode);
        if (updateNode.visible && node.hasClass('hidden')) {
          node.removeClass('hidden');
        } else if (!updateNode.visible && !node.hasClass('hidden')) {
          node.addClass('hidden');
        }
      });

      cy.add(
        addEdges.map(x => {
          const edge = edges[x];
          return {
            group: 'edges',
            data: edgeToCytoscape(edge, maxWidth),
            classes:
              cy.$id(edge.src).hasClass('hidden') ||
              cy.$id(edge.dst).hasClass('hidden')
                ? 'hidden'
                : '',
          };
        })
      );

      deleteEdges.map(x => {
        if (type === 'load') {
          cy.remove(cy.$id(x));
        } else if (type === 'filter') {
          cy.$id(x).addClass('hidden');
        }
      });

      updateEdges.map(x => {
        const updateEdge = edges[x];
        const edge = cy.$id(x);
        edge.data(edgeToCytoscape(updateEdge, maxWidth));
        const shouldHidden =
          cy.$id(updateEdge.src).hasClass('hidden') ||
          cy.$id(updateEdge.dst).hasClass('hidden');
        if (!shouldHidden && edge.hasClass('hidden')) {
          edge.removeClass('hidden');
        } else if (shouldHidden && !edge.hasClass('hidden')) {
          edge.addClass('hidden');
        }
      });

      if (
        cy.nodes().filter(x => x.position().x === 0 && x.position().y === 0)
          .length > 0
      ) {
        const widthPadding = 100;
        const heightPadding = 50;
        const layout = this.cy.elements().layout({
          name: 'cose',
          randomize: true,
          fit: false,
          animate: false,
          boundingBox: {
            x1: widthPadding,
            y1: heightPadding,
            w: cy.width() - widthPadding * 2,
            h: cy.height() - heightPadding * 2,
          },
          padding: 300,
        });

        layout.run();
      }
      cy.endBatch();
    },
    nodeTap(node: NodeSingular) {
      console.log(node.id(), 'tapped');
      const data = node.data() as CytoNodeReady;
      if (data.children.length === 0) return;

      const visibility = !this.cy.$id(data.children[0]).data('visible');
      for (const child of data.children) {
        this.currentGraph.nodes[child].visible = visibility;
      }

      this.draw();
    },
  },
  mounted() {
    this.cy = cytoscape({
      container: this.$el,
      layout: {
        name: 'preset',
      },
      style: [
        {
          selector: '.hidden',
          style: {
            visibility: 'hidden',
          },
        },
        {
          selector: 'node',
          style: {
            'background-color': 'data(color)',
            label: 'data(label)',
            width: 'data(radius)',
            height: 'data(radius)',
          },
        },
        {
          selector: 'edge',
          style: {
            'line-color': 'data(color)',
            width: 'data(width)',
          },
        },
        {
          selector: 'node[label]',
          style: {
            'text-background-color': '#e9eef3',
            'text-background-opacity': 1,
            'text-border-opacity': 1,
            'text-border-width': 1,
            'text-border-style': 'solid',
            'text-border-color': '#333',
            'text-background-padding': '3px',
            'text-margin-y': -5,
          },
        },
      ],
      minZoom: 0.1,
      maxZoom: 10,
    });

    const nodeTap = this.nodeTap;
    this.cy.on('tap', 'node', function (this: NodeSingular) {
      nodeTap(this);
    });
  },
});
</script>

<style scoped>
#cytoscape {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
