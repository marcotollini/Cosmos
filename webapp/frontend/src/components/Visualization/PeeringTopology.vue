<template>
  <cytoscape :graph="graph"></cytoscape>
</template>

<script lang="ts">
import {cloneDeep} from 'lodash';
import {defineComponent} from 'vue';
import Cytoscape from '@/components/Cytoscape.vue';

import {CytoNode, CytoEdge, CytoGraph} from '@/types';

export default defineComponent({
  name: 'PeeringTopology',
  components: {
    Cytoscape,
  },
  data: function () {
    return {
      graph: {} as CytoGraph,
    };
  },
  computed: {
    selectedTimestamp() {
      return this.$store.state.selectedTimestamp;
    },
    selectedVPN() {
      return this.$store.state.selectedVPN;
    },
    activeFilters() {
      return this.$store.state.activeFilters;
    },
  },
  watch: {
    selectedTimestamp() {
      this.loadVisualization();
    },
    selectedVPN() {
      this.loadVisualization();
    },
    activeFilters() {
      this.loadVisualization();
    },
  },
  methods: {
    async loadVisualization() {
      const timestamp = this.selectedTimestamp;
      const vpn = this.selectedVPN;
      if (timestamp === undefined || vpn === undefined) return;

      const result = await this.$http.post(
        '/api/bmp/visualization/peering/topology',
        {
          data: {timestamp, vpn, filters: this.activeFilters},
          headers: {
            REQUEST_ID: 'field_values',
            THROTTLE: '1000',
            CANCEL: 'true',
          },
        }
      );
      const data = result.data as {
        local_bmp_router: string;
        local_rd: string;
        local_ip: string;
        peer_bmp_router: string;
        peer_rd: string;
        peer_ip: string;
      }[];

      const start = new Date().getTime();

      const nodesMap = {} as Record<string, CytoNode>;
      const edgesMap = {} as Record<string, CytoEdge>;

      // extract all nodes
      const nodesRows = data
        .map(x => [
          [x.local_ip, x.local_rd],
          [x.peer_ip, x.peer_rd],
        ])
        .flat();

      // upsh all nodes into nodes
      for (const n of nodesRows) {
        const idNode = `${n[0]}-${n[1]}`;
        if (!nodesMap[idNode]) {
          nodesMap[idNode] = {
            id: idNode,
            label: idNode,
          } as CytoNode;
        }
      }

      for (const connection of data) {
        const idLocal = `${connection.local_ip}-${connection.local_rd}`;
        const idPeer = `${connection.peer_ip}-${connection.peer_rd}`;
        const [a, b] = idLocal < idPeer ? [idLocal, idPeer] : [idPeer, idLocal];
        const idEdge = `${a}-${b}`;
        if (!edgesMap[idEdge]) {
          edgesMap[idEdge] = {
            id: idEdge,
            src: a,
            dst: b,
          } as CytoEdge;
        }
      }

      this.graph = {nodes: nodesMap, edges: edgesMap} as CytoGraph;
      const end = new Date().getTime();
      console.log('Peering Topology graph generated in', end - start, 'ms');
    },
  },
  mounted() {
    this.$store.commit('selectedVisualization', 'peering-topology');
    this.loadVisualization();
  },
});
</script>

<style>
.form-medium {
  width: 95% !important;
}
</style>
