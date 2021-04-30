<template>
  <side-bottom-three-slots>
    <template v-slot:side-top>
      <el-row>
        <el-col :span="24" class="text-center">
          <timestamp></timestamp>
        </el-col>
        <el-col :span="24" class="text-center">
          <VPN-list></VPN-list>
        </el-col>
        <el-col :span="24" class="text-center">
          <visualization></visualization>
        </el-col>
      </el-row>
      <el-divider>Active Filters</el-divider>
      <el-row>
        <el-col :span="24" class="text-center">
          Place your filters here
          <filters-active></filters-active>
        </el-col>
      </el-row>
      <el-row>
        <el-divider>All Filters</el-divider>
        <el-col :span="24" class="text-center">
          <filters-draggable></filters-draggable>
        </el-col>
      </el-row>
    </template>
    <template v-slot:main>
      <template v-if="selectedVisualization === 'vpn-topology'">
        <VPN-topology></VPN-topology>
      </template>
      <template v-else-if="selectedVisualization === 'vpn-routing-topology'">
        <VPN-routing-topology></VPN-routing-topology>
      </template>
      <template v-else-if="selectedVisualization === 'peering-topology'">
        <peering-topology></peering-topology>
      </template>
      <template v-else-if="selectedVisualization === 'list'">
        <list-visualization></list-visualization>
      </template>
    </template>
    <template v-slot:footer>
      <timeseries :height="140"></timeseries>
    </template>
  </side-bottom-three-slots>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import SideBottomThreeSlots from '@/views/Structure/SideBottomThreeSlots.vue';
import Timestamp from '@/components/Selection/Timestamp.vue';
import VPNList from '@/components/Selection/VPNList.vue';
import Visualization from '@/components/Selection/Visualization.vue';
import FiltersDraggable from '@/components/FiltersDraggable.vue';
import FiltersActive from '@/components/FiltersActive.vue';
import Timeseries from '@/components/Timeseries.vue';

import VPNTopology from '@/components/Visualization/VPNTopology.vue';
import VPNRoutingTopology from '@/components/Visualization/VPNRoutingTopology.vue';
import PeeringTopology from '@/components/Visualization/PeeringTopology.vue';
import ListVisualization from '@/components/Visualization/List.vue';
import {debounce, isEqual} from 'lodash';

export default defineComponent({
  name: 'MainVisualization',
  components: {
    SideBottomThreeSlots,
    Timestamp,
    VPNList,
    Visualization,
    FiltersDraggable,
    FiltersActive,
    Timeseries,
    VPNTopology,
    VPNRoutingTopology,
    PeeringTopology,
    ListVisualization,
  },
  data() {
    return {
      loaded: undefined as Record<string, unknown> | undefined,
      saveQueryDebound: debounce(() => this.saveQuery(), 100),
      defaultVals: {
        view: undefined,
        vpn: undefined,
        timestamp: undefined,
        filters: {},
        custom: {},
      },
    };
  },
  computed: {
    selectedVisualization(): string {
      return this.$store.state.selectedVisualization;
    },
    selectedTimestamp(): Date {
      return this.$store.state.selectedTimestamp;
    },
    selectedVPN(): string {
      return this.$store.state.selectedVPN;
    },
    activeFilters() {
      return this.$store.state.activeFilters;
    },
    customVisualizationQuery(): string {
      return this.$store.state.customVisualizationQuery;
    },
  },
  watch: {
    selectedVisualization() {
      this.saveQueryDebound();
    },
    selectedTimestamp() {
      this.saveQueryDebound();
    },
    selectedVPN() {
      this.saveQueryDebound();
    },
    activeFilters() {
      this.saveQueryDebound();
    },
    customVisualizationQuery() {
      this.saveQueryDebound();
    },
  },
  methods: {
    async saveQuery() {
      const timestamp = this.selectedTimestamp;
      const vpn = this.selectedVPN;
      if (timestamp === undefined || vpn === undefined) return;

      const payload = {
        view: this.selectedVisualization,
        timestamp,
        vpn,
        filters: this.activeFilters,
        custom: this.customVisualizationQuery,
      };

      if (isEqual(this.loaded, payload)) {
        // no need to save as the query is already the correct one
        return;
      }

      this.loaded = payload;
      const result = await this.$http.post('/api/query/save', {
        payload,
        headers: {
          REQUEST_ID: 'save_query',
          THROTTLE: '500',
          CANCEL: 'true',
        },
      });

      const id = result.data;
      this.$router.push(`/q/${id}`);
    },
  },
  async mounted() {
    if (this.$route.name === 'query') {
      const id = this.$route.params.catchAll;
      try {
        const result = await this.$http.get(`/api/query/get/${id}`);
        const payload = {...this.defaultVals, ...result.data.payload};
        payload.timestamp = payload.timestamp
          ? new Date(payload.timestamp)
          : payload.timestamp;

        this.loaded = payload;
        this.$store.commit('selectedTimestamp', payload.timestamp);
        this.$store.commit('selectedVPN', payload.vpn);
        this.$store.commit('selectedVisualization', payload.view);
        this.$store.commit('activeFilters', payload.filters);
        this.$store.commit('customVisualizationQuery', payload.custom);
      } catch (e) {
        this.$router.push({name: 'default'});
      }
    }
  },
});
</script>

<style>
.form-medium {
  width: 95% !important;
}

.el-divider__text {
  background-color: #fafafa !important;
}
</style>
