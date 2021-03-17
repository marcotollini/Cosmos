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
    commit: Object,
    modify: Object
  },
  data: () => ({
    cytoscape: cytoscape.prototype
  }),
  computed: {
  },
  watch: {
    commit(newVal){
      this.cytoscape.destroy()
      console.log('destroyed')

      this.cytoscape = cytoscape(
      {
        container: this.$el,
        layout: {
          name: 'preset'
        },
        style: [
          {
            selector: 'node',
            style: {
              'background-color': 'data(color)',
              'label': 'data(name)',
              'width': 'data(radius)',
              'height': 'data(radius)',
            }
          },
          {
            selector: 'edge',
            style: {
              'line-color': 'data(color)',
              'width': 'data(width)'
            }
          },
        ],
        minZoom: 0.1,
        maxZoom: 10
      }
    )

    for(let i = 0; i < 1000; i++){
      const x = Math.random() * 500
      const y = Math.random() * 500
      const nodeObj = {
        group: 'nodes',
        data: {
          id: i,
          color: 'red',
          name: `Node: ${i}`,
          radius: Math.random() * 29 + 1
        },
        position: {x, y}
      }
      this.cytoscape.add(nodeObj)

    }


      // for(const node of newVal){
      //   const x = Math.random() * 500
      //   const y = Math.random() * 500
      //   console.log(node, x, y)
      //   const nodeObj = {
      //     group: 'nodes',
      //     data: {
      //       id: node,
      //       color: 'red',
      //       name: `Node: ${node}`,
      //       radius: Math.random() * 29 + 1
      //     },
      //     position: {x, y}
      //   }
      //   this.cytoscape.add(nodeObj)

      //   setTimeout(function(that: any) {
      //     const n = that.cytoscape.$('#'+node);
      //     n.data('id', n.data('id') + 10)
      //     console.log('here post', n.data('id'))
      //   }, 1000, this)
      // }
    }
  },
  mounted(){
    this.cytoscape = cytoscape(
      {
        container: this.$el,
        layout: {
          name: 'preset'
        },
        style: [
          {
            selector: 'node',
            style: {
              'background-color': 'data(color)',
              'label': 'data(name)',
              'width': 'data(radius)',
              'height': 'data(radius)',
            }
          },
          {
            selector: 'edge',
            style: {
              'line-color': 'data(color)',
              'width': 'data(width)'
            }
          },
        ],
        minZoom: 0.1,
        maxZoom: 10
      }
    )
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