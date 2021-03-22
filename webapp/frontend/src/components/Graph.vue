<template>
  <div class="graph">
    <el-container class="el-container-global">
      <el-aside width="20%">
        <Filter v-on:load-data="loadState" />
      </el-aside>
      <el-container>
        <el-main>
          <Cytoscape :graph="graph" />
        </el-main>
        <el-footer height="100px">Footer</el-footer>
      </el-container>
    </el-container>
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

<style>
body {
  margin: 0;
  color: #333;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB';
}
</style>

<style scoped>
.el-header,
.el-footer {
  background-color: #b3c0d1;
}

.el-aside {
  background-color: #d3dce6;
  min-width: 250px;
}

.el-main {
  background-color: #e9eef3;
  margin: 0;
  padding: 0;
}

.el-container-global {
  height: 100vh;
}
</style>
