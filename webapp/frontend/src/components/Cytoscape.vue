<template>
  <div id="cytoscape"></div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import cytoscape from 'cytoscape';
import _ from 'lodash';
import {CytoGraph, CytoEdge} from 'cosmos-lib/src/types';

function edgeToCytoscape(edge: CytoEdge, maxWidth: number) {
  return {
    id: edge.id,
    source: edge.src,
    target: edge.dst,
    width: Math.max(edge.width / maxWidth, 2),
    color: edge.color,
  };
}

function sleep(ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

export default defineComponent({
  name: 'Cytoscape',
  props: {
    graph: {},
  },
  data: () => ({
    cy: undefined as cytoscape.Core | undefined,
  }),
  computed: {},
  watch: {
    async graph() {
      if (this.cy === undefined) return;
      const cy = this.cy;

      const graph = this.$props.graph as CytoGraph;
      const type = graph.type;
      const maxWidth = Object.values(graph.edges).reduce((prev, curr) => {
        return Math.max(prev, curr.width);
      }, 0);

      const oldNodes = this.cy.nodes().map(x => x.id());
      const oldNodesSet = new Set(oldNodes);

      const newNodes = Object.values(graph.nodes).map(x => x.id);
      const newNodesSet = new Set(newNodes);

      const addNodes = newNodes.filter(x => !oldNodesSet.has(x));
      const [deleteNodes, updateNodes] = _.partition(
        oldNodes,
        x => !newNodesSet.has(x)
      );

      const oldEdges = this.cy.edges().map(x => x.id());
      const oldEdgesSet = new Set(oldEdges);

      const newEdges = Object.values(graph.edges).map(x => x.id);
      const newEdgesSet = new Set(newEdges);

      const addEdges = newEdges.filter(x => !oldEdgesSet.has(x));
      const [deleteEdges, updateEdges] = _.partition(
        oldEdges,
        x => !newEdgesSet.has(x)
      );

      // if (deleteNodes.length !== 0 || deleteEdges.length !== 0) {
      //   cy.startBatch();
      //   deleteNodes.map(x => {
      //     cy.$id(x).data('color', 'red');
      //   });

      //   deleteEdges.map(x => {
      //     cy.$id(x).data('color', 'red');
      //   });
      //   cy.endBatch();
      //   await sleep(500);
      // }

      cy.startBatch();
      this.cy.add(
        addNodes.map(x => {
          return {group: 'nodes', data: graph.nodes[x]};
        })
      );

      deleteNodes.map(x => {
        if (type === 'load') {
          cy.remove(cy.$id(x));
        } else if (type === 'filter') {
          cy.$id(x).style('visibility', 'hidden');
        }
      });

      updateNodes.map(x => {
        const node = cy.$id(x);
        node.data(graph.nodes[x]);
        if (type === 'filter') {
          node.style('visibility', 'visible');
        }
      });

      this.cy.add(
        addEdges.map(x => {
          return {
            group: 'edges',
            data: edgeToCytoscape(graph.edges[x], maxWidth),
          };
        })
      );

      deleteEdges.map(x => {
        if (type === 'load') {
          cy.remove(cy.$id(x));
        } else if (type === 'filter') {
          cy.$id(x).style('visibility', 'hidden');
        }
      });

      updateEdges.map(x => {
        const edge = cy.$id(x);
        edge.data(edgeToCytoscape(graph.edges[x], maxWidth));
        if (type === 'filter') {
          edge.style('visibility', 'visible');
        }
      });

      if (
        this.cy
          .nodes()
          .filter(x => x.position().x === 0 && x.position().y === 0).length > 0
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
  },
  mounted() {
    this.cy = cytoscape({
      container: this.$el,
      layout: {
        name: 'preset',
      },
      style: [
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
