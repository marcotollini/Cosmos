<template>
  <div ref="cytoscape" style="width: 100%; height: 100%">
    <cytoscape :graph="graph"></cytoscape>
  </div>
</template>

<script lang="ts">
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
      loadingObject: undefined as any,
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
    showLoading() {
      return this.$store.state.showLoading;
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

      if (this.loadingObject !== undefined) {
        this.loadingObject.close();
        this.loadingObject = undefined;
      }

      if (this.showLoading) {
        this.loadingObject = this.$loading({
          target: this.$refs.cytoscape,
          lock: true,
        });
      }

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

      if (this.loadingObject !== undefined) {
        this.loadingObject.close();
        this.loadingObject = undefined;
      }

      this.$store.commit('timestampLoadedView', timestamp);
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
