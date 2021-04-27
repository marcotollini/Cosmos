<template>
  <cytoscape :graph="graph"></cytoscape>
</template>

<script lang="ts">
import {cloneDeep} from 'lodash';
import {defineComponent} from 'vue';
import Cytoscape from '@/components/Cytoscape.vue';

import {CytoNode, CytoEdge, CytoGraph} from '@/types';

export default defineComponent({
  name: 'VPNTopology',
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

      const activeFilters = cloneDeep(this.activeFilters);
      for (const fieldName in activeFilters) {
        activeFilters[fieldName] = activeFilters[fieldName].map((x: string) => {
          if (x === 'null') return null;
          else if (x === 'true') return true;
          else if (x === 'false') return false;
          return x;
        });
      }

      const result = await this.$http.post(
        '/api/bmp/visualization/vpn/topology',
        {
          data: {timestamp, vpn, filters: activeFilters},
          headers: {
            REQUEST_ID: 'field_values',
            THROTTLE: '1000',
            CANCEL: 'true',
          },
        }
      );
      const data = result.data as {bmp_router: string; rd: string}[];

      const start = new Date().getTime();

      const bmp_router_rd_map = {} as Record<string, string[]>;
      data.forEach(x => {
        if (!bmp_router_rd_map[x.bmp_router])
          bmp_router_rd_map[x.bmp_router] = [];
        bmp_router_rd_map[x.bmp_router].push(x.rd);
      });

      const nodes = [] as CytoNode[];
      const edges = [] as CytoEdge[];

      const vpnNode = {
        id: vpn,
        label: vpn,
        color: 'accent',
      } as CytoNode;
      nodes.push(vpnNode);

      for (const bmp_router in bmp_router_rd_map) {
        const children = bmp_router_rd_map[bmp_router].map(rd => {
          return {
            id: `${bmp_router}-${rd}`,
            label: rd,
          } as CytoNode;
        });

        const idChildren = children.map(x => x.id);
        const idParent = bmp_router;

        const childrenLinks = idChildren.map(idChild => {
          return {
            id: `${idParent}->${idChild}`,
            src: idParent,
            dst: idChild,
          } as CytoEdge;
        });

        const parent = {
          id: idParent,
          label: bmp_router,
          children: idChildren,
        } as CytoNode;

        const parentLinkVPN = {
          id: `${idParent}->${vpn}`,
          src: idParent,
          dst: vpn,
        } as CytoEdge;

        nodes.push(...children, parent);
        edges.push(...childrenLinks, parentLinkVPN);
      }

      const nodesMap = {} as Record<string, CytoNode>;
      nodes.forEach(x => {
        nodesMap[x.id] = x;
      });
      const edgesMap = {} as Record<string, CytoEdge>;
      edges.forEach(x => {
        edgesMap[x.id] = x;
      });

      this.graph = {nodes: nodesMap, edges: edgesMap} as CytoGraph;
      const end = new Date().getTime();
      console.log('VPN Topology graph generated in', end - start, 'ms');
    },
  },
  mounted() {
    this.$store.commit('selectedVisualization', 'vpn-topology');
    this.loadVisualization();
  },
});
</script>

<style>
.form-medium {
  width: 95% !important;
}
</style>
