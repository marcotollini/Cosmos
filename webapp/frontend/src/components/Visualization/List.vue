<template>
  <el-container class="full-height">
    <el-header height="auto">
      <filters-show v-model:selected="showCols"></filters-show>
    </el-header>
    <el-main id="table-main-el">
      <el-table
        :data="data"
        v-loading="loading"
        size="mini"
        height="100%"
        stripe
        highlight-current-row
        fit
        :span-method="arraySpanMethod"
      >
        <el-table-column
          v-for="prop in props"
          :key="prop"
          :prop="prop"
          :label="prop"
          sortable
        >
        </el-table-column>
      </el-table>
    </el-main>
  </el-container>
</template>

<script lang="ts">
import {isArray, isEmpty, isString} from 'lodash';
import {defineComponent} from 'vue';
import FiltersShow from '../FiltersShow.vue';

export default defineComponent({
  name: 'VPNRoutingTopology',
  components: {
    FiltersShow,
  },
  data() {
    return {
      data: [] as Record<string, unknown>[],
      props: [] as string[],
      showCols: ['bmp_router', 'rd', 'ip_prefix', 'bgp_nexthop', 'comms'],
      loading: false as boolean,
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
    customVisualizationQuery() {
      return this.$store.state.customVisualizationQuery;
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
    showCols() {
      this.loadVisualization();
      this.$store.commit('customVisualizationQuery', this.showCols);
    },
  },
  methods: {
    async loadVisualization() {
      const timestamp = this.selectedTimestamp;
      const vpn = this.selectedVPN;
      if (timestamp === undefined || vpn === undefined) return;

      this.loading = true;

      try {
        const result = await this.$http.post('/api/bmp/visualization/list', {
          data: {
            timestamp,
            vpn,
            filters: this.activeFilters,
            show: this.showCols,
          },
          headers: {
            REQUEST_ID: 'field_values',
            THROTTLE: '1000',
            CANCEL: 'true',
          },
        });
        const data = result.data as Record<string, unknown>[];

        if (data.length === 0) {
          this.props = [];
          this.data = [];
          return;
        }

        this.props = Object.keys(data[0]);

        for (const elem of data) {
          for (const prop in elem) {
            const property = elem[prop];
            if (isArray(property)) {
              elem[prop] = property.join(', ');
            } else if (!isString(property)) {
              elem[prop] = `${property}`;
            }
          }
        }
        if (data.length === 101) {
          data[100] = {
            bmp_router: 'Other rows available. Use filters to see them.',
          };
        }
        this.data = data;
      } finally {
        this.loading = false;
      }
    },
    arraySpanMethod({
      row,
      column,
      rowIndex,
      columnIndex,
    }: {
      row: unknown;
      column: unknown;
      rowIndex: number;
      columnIndex: number;
    }) {
      if (rowIndex === 100) {
        return [1, this.showCols.length];
      }
      return [1, 1];
    },
  },
  mounted() {
    this.$store.commit('selectedVisualization', 'list');
    if (!isEmpty(this.customVisualizationQuery)) {
      this.showCols = this.customVisualizationQuery;
    }
    this.loadVisualization();
  },
  unmounted() {
    this.$store.commit('customVisualizationQueryDefault');
  },
});
</script>

<style scoped>
.full-height {
  height: 100%;
}
#table-main-el {
  padding: 0;
}
</style>

<style>
.form-medium {
  width: 95% !important;
}
</style>
