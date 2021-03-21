<template>
  <div id="cytoscape"></div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import cytoscape from 'cytoscape';

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
      const graph = this.$props.graph as {
        [key: string]: {
          src: string;
          dst: string;
          prefixes: string[];
        };
      };

      const maxPrefixes = Object.values(graph).reduce((prev, curr) => {
        return Math.max(prev, curr.prefixes.length);
      }, 0);

      for (const peeringKey in graph) {
        const src = graph[peeringKey].src;
        const dst = graph[peeringKey].dst;
        const prefixes = graph[peeringKey].prefixes;
        if (this.cytoscape.$id(src).length === 0) {
          this.cytoscape.add({
            group: 'nodes',
            data: {
              id: src,
              color: 'red',
              name: src,
              radius: 20,
            },
            position: {x: Math.random() * 500, y: Math.random() * 500},
          });
        }
        if (this.cytoscape.$id(dst).length === 0) {
          this.cytoscape.add({
            group: 'nodes',
            data: {
              id: dst,
              color: 'red',
              name: dst,
              radius: 20,
            },
            position: {x: Math.random() * 500, y: Math.random() * 500},
          });
        }

        if (this.cytoscape.$id([src, dst].join('-')).length === 0) {
          this.cytoscape.add({
            group: 'edges',
            data: {
              id: [src, dst].join('-'),
              source: src,
              target: dst,
              width: (prefixes.length / maxPrefixes) * 5,
            },
          });
        }
      }
      // for (let i = 0; i < 1000; i++) {
      //   const x = Math.random() * 500;
      //   const y = Math.random() * 500;
      //   const nodeObj = {
      //     group: 'nodes',
      //     data: {
      //       id: i,
      //       color: 'red',
      //       name: `Node: ${i}`,
      //       radius: Math.random() * 29 + 1,
      //     },
      //     position: {x, y},
      //   };
      //   this.cytoscape.add(nodeObj);
      // }
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
            label: 'data(name)',
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
