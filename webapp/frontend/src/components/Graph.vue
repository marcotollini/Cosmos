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
    graph: {},
  }),
  methods: {
    loadState: async function (info: {vpn: string; timestamp: number}) {
      console.log('Graph loading state!', info);
      const {vpn, timestamp} = info;
      const response = await axios.get(
        'http://10.212.226.67:3000/api/bmp/state',
        {
          params: {
            vpn,
            timestamp,
          },
        }
      );
      const statePkt: StatePkt = response.data;

      this.currentState = statePkt;

      const graph: {
        [key: string]: {src: string; dst: string; prefixes: string[]};
      } = {};
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
          const nodeKey = `${src}-${dst}`;
          if (!graph[nodeKey]) {
            graph[nodeKey] = {
              src,
              dst,
              prefixes: [],
            };
          }
          graph[nodeKey].prefixes.push(event.ip_prefix);
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
