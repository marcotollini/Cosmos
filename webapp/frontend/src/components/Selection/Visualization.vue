<template>
  <el-row>
    <el-col :span="24" class="text-center">
      <el-select
        v-model="selectedVisualization"
        filterable
        size="medium"
        placeholder="Select visualization"
        class="form-medium"
      >
        <el-option
          v-for="vis of visualizations"
          :key="vis.route"
          :label="vis.name"
          :value="vis.route"
        >
        </el-option>
      </el-select>
    </el-col>
  </el-row>
</template>

<script lang="ts">
import {defineComponent} from 'vue';

// TODO: move to cosmos-lib
// import {visualizationType} from 'cosmos-lib';
type visualizationType =
  | 'VPNTopology'
  | 'VPNRoutingTopology'
  | 'PeeringTopology';

export default defineComponent({
  name: 'Timestamp',
  data() {
    return {
      visualizations: [
        {
          name: 'VPN Topology',
          route: 'vpn-topology',
        },
        {
          name: 'VPN Routing Topology',
          route: 'vpn-routing-topology',
        },
        {
          name: 'Peering Topology',
          route: 'peering-topology',
        },
      ],
    };
  },
  computed: {
    selectedVisualization: {
      get() {
        return this.$store.state.selectedVisualization;
      },
      set(selection: visualizationType | undefined) {
        this.$store.commit('selectedVisualization', selection);
      },
    },
  },
});
</script>

<style scoped>
h1 {
  margin: 0;
  padding: 10px 0;
  text-align: center;
  font-size: 1.3em;
}

a {
  text-decoration: none;
  color: inherit;
}
</style>
