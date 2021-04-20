<template>
  <el-table
    :data="tableData"
    size="mini"
    stripe
    height="100%"
    highlight-current-row
    fit
  >
    <el-table-column
      v-for="prop in props"
      :key="prop"
      :prop="prop"
      :label="prop"
      sortable
    >
    </el-table-column>
    <!-- <el-table-column prop="address" label="Address" sortable>
      <template #header>
        <el-input v-model="search" size="mini" placeholder="Type to search" />
      </template>
    </el-table-column> -->
  </el-table>
</template>

<script lang="ts">
import {cloneDeep} from 'lodash';
import {defineComponent} from 'vue';

export default defineComponent({
  name: 'VPNRoutingTopology',
  data() {
    return {
      tableData: [] as {
        bmp_router: string;
        rd: string;
        ip_prefix: string;
        bmp_nexthop: string;
        comms: string | string[];
      }[],
      props: [] as string[],
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

      this.props = [];
      this.tableData = [];

      const result = await this.$http.post('/api/bmp/visualization/list', {
        data: {timestamp, vpn, filters: activeFilters},
        headers: {
          REQUEST_ID: 'field_values',
          THROTTLE: '1000',
          CANCEL: 'true',
        },
      });
      const data = result.data as {
        bmp_router: string;
        rd: string;
        ip_prefix: string;
        bmp_nexthop: string;
        comms: string | string[];
      }[];

      if (data.length === 0) return;

      this.props = Object.keys(data[0]);
      const dataString = data.map(x => {
        if (Array.isArray(x.comms)) {
          x.comms = x.comms.join(', ');
        }
        return x;
      });
      this.tableData = dataString;
    },
  },
  mounted() {
    this.$store.commit('selectedVisualization', 'list');
    this.loadVisualization();
  },
});
</script>

<style>
.form-medium {
  width: 95% !important;
}
</style>
