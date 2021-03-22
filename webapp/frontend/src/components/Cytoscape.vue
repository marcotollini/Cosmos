<template>
  <div id="cytoscape"></div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import cytoscape from 'cytoscape';
import {CytoGraph, CytoEdge} from '../types';

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
  data: (): {cy: cytoscape.Core | undefined} => ({
    cy: cytoscape.prototype,
  }),
  computed: {},
  watch: {
    async graph() {
      if (this.cy === undefined) return;
      const cy = this.cy;

      const graph = this.$props.graph as CytoGraph;
      const maxWidth = Object.values(graph.edges).reduce((prev, curr) => {
        return Math.max(prev, curr.width);
      }, 0);

      const oldNodes = this.cy.nodes().map(x => x.id());
      const oldNodesSet = new Set(oldNodes);

      const newNodes = Object.values(graph.nodes).map(x => x.id);
      const newNodesSet = new Set(newNodes);

      const addNodes = newNodes.filter(x => !oldNodesSet.has(x));
      const deleteNodes = oldNodes.filter(x => !newNodesSet.has(x));
      const updateNodes = oldNodes.filter(x => newNodesSet.has(x));

      const oldEdges = this.cy.edges().map(x => x.id());
      const oldEdgesSet = new Set(oldEdges);

      const newEdges = Object.values(graph.edges).map(x => x.id);
      const newEdgesSet = new Set(newEdges);

      const addEdges = newEdges.filter(x => !oldEdgesSet.has(x));
      const deleteEdges = oldEdges.filter(x => !newEdgesSet.has(x));
      const updateEdges = oldEdges.filter(x => newEdgesSet.has(x));

      deleteNodes.map(x => {
        cy.$id(x).data('color', 'red');
      });

      deleteEdges.map(x => {
        cy.$id(x).data('color', 'red');
      });

      await sleep(1000);

      this.cy.add(
        addNodes.map(x => {
          return {group: 'nodes', data: graph.nodes[x]};
        })
      );

      deleteNodes.map(x => {
        cy.remove(cy.$id(x));
      });

      updateNodes.map(x => {
        cy.$id(x).data(graph.nodes[x]);
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
        cy.remove(cy.$id(x));
      });

      updateEdges.map(x => {
        cy.$id(x).data(edgeToCytoscape(graph.edges[x], maxWidth));
      });

      const layout = this.cy.elements().layout({
        name: 'random',
        fit: false,
      });

      layout.run();

      console.log('done');
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
      ],
      minZoom: 0.1,
      maxZoom: 10,
    });
  },
});
</script>

<style scoped>
#cytoscape {
  /* position: absolute; */
  /* left: 0;
  top: 0;
  right: 0;
  bottom: 0; */
  width: 100%;
  height: 100%;
}
</style>
