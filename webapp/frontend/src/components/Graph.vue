<template>
  <div class="graph">
    <Fullscreen>
      <Cytoscape :graph="graph" />
    </Fullscreen>
    <Sidebar>
      <Filter v-on:load-data="loadState" />
    </Sidebar>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import axios from 'axios';
import {StatePkt} from 'cosmos-lib/src/types';
import {CytoGraph, CytoNode, CytoEdge} from '../types';

import Sidebar from '@/views/Sidebar.vue';
import Fullscreen from '@/views/Fullscreen.vue';

import Filter from '@/components/Filter.vue';
import Cytoscape from '@/components/Cytoscape.vue';

export default defineComponent({
  name: 'Graph',
  components: {
    Sidebar,
    Fullscreen,
    Filter,
    Cytoscape,
  },
  data: () => ({
    currentState: {} as StatePkt,
    graph: {} as CytoGraph,
  }),
  methods: {
    loadState: async function (info: {vpn: string; timestamp: number}) {
      console.log('Graph loading state!', info);
      const {vpn, timestamp} = info;
      const response = await axios.get(
        'http://10.212.226.67:3000/api/bmp/state',
        {params: {vpn, timestamp}}
      );
      const statePkt: StatePkt = response.data;

      this.currentState = statePkt;

      const graph: CytoGraph = {
        nodes: {},
        edges: {},
        type: 'new',
      };

      for (const vrKey in this.currentState.state) {
        const router = this.currentState.state[vrKey];
        // const vr = router.virtualRouter;
        for (const event of router.events) {
          if (
            !(event.is_in || event.is_out) ||
            !event.peer_ip ||
            !event.bgp_nexthop ||
            !event.ip_prefix
          )
            continue;
          const src = event.peer_ip;
          const dst = event.bgp_nexthop;
          if (!graph.nodes[src])
            graph.nodes[src] = {
              id: src,
              label: src,
              color: 'red',
              radius: 10,
              display: true,
            };
          if (!graph.nodes[dst])
            graph.nodes[dst] = {
              id: dst,
              label: dst,
              color: 'blue',
              radius: 10,
              display: true,
            };

          const edgeKey = `${src}-${dst}`;
          if (!graph.edges[edgeKey]) {
            graph.edges[edgeKey] = {
              id: edgeKey,
              src,
              dst,
              color: 'green',
              width: 0,
            };
          }

          graph.edges[edgeKey].width += 1;
        }
      }
      console.log('assigned');

      this.$data.graph = graph;
    },
  },
  mounted() {
    this.currentState = {} as StatePkt;
  },
});
</script>
