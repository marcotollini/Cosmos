<template>
  <div id="cytoscape">

  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import cytoscape from 'cytoscape';

export default defineComponent({
  name: 'Cytoscape',
  props: {
    graph: Object
  },
  data: () => ({
    cytoscape: cytoscape.prototype
  }),
  computed: {
  },
  watch: {
    graph(newVal, oldVal){
      for(const node of newVal){
        const x = Math.random() * 500
        const y = Math.random() * 500
        console.log(node, x, y)
        this.cytoscape.add({
          group: 'nodes',
          data: {id: node},
          position: {x, y}
        })
      }
    }
  },
  mounted(){
    this.cytoscape = cytoscape({container: this.$el, style: [ // the stylesheet for the graph
    {
      selector: 'node',
      style: {
        'background-color': '#666',
        'label': 'data(id)'
      }
    },

    {
      selector: 'edge',
      style: {
        'width': 3,
        'line-color': '#ccc',
        'target-arrow-color': '#ccc',
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier'
      }
    }
  ],
})
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