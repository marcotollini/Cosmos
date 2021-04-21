<template>
  <el-table
    :data="data"
    v-loading="loading"
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
  </el-table>
</template>

<script lang="ts">
import {cloneDeep, isArray, isString} from 'lodash';
import {defineComponent} from 'vue';

export default defineComponent({
  name: 'VPNRoutingTopology',
  data() {
    return {
      data: [] as Record<string, unknown>[],
      props: [] as string[],
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

      this.loading = true;

      try {
        const result = await this.$http.post('/api/bmp/visualization/list', {
          data: {timestamp, vpn, filters: activeFilters},
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

        this.data = data;
      } finally {
        this.loading = false;
      }
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
