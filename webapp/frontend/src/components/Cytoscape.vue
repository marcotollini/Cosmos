<template>
  <div id="cytoscape"></div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import cytoscape from 'cytoscape';
import {CytoGraph, CytoNode, CytoEdge} from '../types';
import {PropType} from 'vue';

export default defineComponent({
  name: 'Cytoscape',
  props: {
    graph: {},
  },
  data: () => ({
    cytoscape: cytoscape.prototype,
  }),
  computed: {},
  watch: {
    graph() {
      const graph = this.$props.graph as CytoGraph;

      const maxWidth = Object.values(graph.edges).reduce((prev, curr) => {
        return Math.max(prev, curr.width);
      }, 0);

      for (const nodeKey in graph.nodes) {
        const node = graph.nodes[nodeKey];
        if (this.cytoscape.$id(node.id).length === 0) {
          this.cytoscape.add({
            group: 'nodes',
            data: {
              id: node.id,
              color: node.color,
              label: node.label,
              radius: node.radius,
            },
          });
        }
      }

      for (const edgeKey in graph.edges) {
        const edge = graph.edges[edgeKey];

        if (this.cytoscape.$id(edgeKey).length === 0) {
          this.cytoscape.add({
            group: 'edges',
            data: {
              id: edge.id,
              source: edge.src,
              target: edge.dst,
              width: (edge.width / maxWidth) * 5,
              color: edge.color,
            },
          });
        } else {
          this.cytoscape.$id(edgeKey).data({
            id: edge.id,
            source: edge.src,
            target: edge.dst,
            width: (edge.width / maxWidth) * 5,
            color: 'blue',
          });
        }
      }

      const layout = this.cytoscape.elements().layout({
        name: 'random',
        fit: false,
      });

      layout.run();
    },
  },
  mounted() {
    this.cytoscape = cytoscape({
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
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
}
</style>
