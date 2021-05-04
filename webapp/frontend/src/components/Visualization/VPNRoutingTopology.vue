<template>
  <div ref="cytoscape" style="width: 100%; height: 100%">
    <cytoscape :graph="graph"></cytoscape>
  </div>
</template>

<script lang="ts">
import {cloneDeep, isEqual, uniqWith} from 'lodash';
import {defineComponent} from 'vue';
import Cytoscape from '@/components/Cytoscape.vue';

import {CytoNode, CytoEdge, CytoGraph} from '@/types';

export default defineComponent({
  name: 'VPNRoutingTopology',
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
        '/api/bmp/visualization/vpn/routing-topology',
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
        src_bmp_router: string;
        src_rd: string;
        dst_bmp_router: string;
        dst_rd: string;
      }[];

      const start = new Date().getTime();

      const nodesMap = {} as Record<string, CytoNode>;
      const edgesMap = {} as Record<string, CytoEdge>;

      // extract all nodes
      const nodesRows = data
        .map(x => [
          [x.src_bmp_router, x.src_rd],
          [x.dst_bmp_router, x.dst_rd],
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
        const idSrc = `${connection.src_bmp_router}-${connection.src_rd}`;
        const idDst = `${connection.dst_bmp_router}-${connection.dst_rd}`;
        const [a, b] = idSrc < idDst ? [idSrc, idDst] : [idDst, idSrc];
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
      console.log('VPN Routing Topology graph generated in', end - start, 'ms');

      if (this.loadingObject !== undefined) {
        this.loadingObject.close();
        this.loadingObject = undefined;
      }

      this.$store.commit('timestampLoadedView', timestamp);
    },
  },
  mounted() {
    this.$store.commit('selectedVisualization', 'vpn-routing-topology');
    this.loadVisualization();
  },
});
</script>

<style>
.form-medium {
  width: 95% !important;
}
</style>
