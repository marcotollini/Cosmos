<template>
  <div class="graph">
    <el-container class="el-container-global">
      <el-aside width="20%">
        <el-container class="el-container-global">
          <el-main style="border-right: 1px #909399 solid" class="mac-scroll">
            <div class="side-top">
              <load-data-form v-on:load-data="loadState" />
              <filter-route-monitor
                :currentState="currentState"
                v-on:filter-data="filterState"
              />
            </div>
          </el-main>
          <el-footer class="side-bottom" height="200px">Footer</el-footer>
        </el-container>
      </el-aside>
      <el-container>
        <el-main>
          <cytoscape :graph="graph" />
        </el-main>
        <el-footer height="200px" class="timeseries">
          <timeseries-chart />
        </el-footer>
      </el-container>
    </el-container>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import axios from 'axios';
import _ from 'lodash';
import {StatePkt, BMPDump, BMPEvent} from 'cosmos-lib/src/types';
import {CytoGraph} from '../types';

import LoadDataForm from '@/components/FormLoadData.vue';
import FilterRouteMonitor from '@/components/FilterRouteMonitor.vue';
import Cytoscape from '@/components/Cytoscape.vue';
import TimeseriesChart from '@/components/TimeseriesChart.vue';
import {RouteLocationNormalizedLoaded} from 'vue-router';

type BMPFilter = {
  [key in keyof (BMPDump | BMPEvent)]?: any[];
};
function stateToGraph(statePkt: StatePkt) {
  const graph: CytoGraph = {
    nodes: {},
    edges: {},
  };

  for (const vrKey in statePkt.state) {
    const vr = statePkt.state[vrKey];
    const virtualRouter = vr.virtualRouter;
    for (const event of vr.events) {
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
          color: 'blue',
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

  return graph;
}

export default defineComponent({
  name: 'Graph',
  components: {
    LoadDataForm,
    FilterRouteMonitor,
    Cytoscape,
    TimeseriesChart,
  },
  data() {
    return {
      currentState: {} as StatePkt,
      filteredState: {} as StatePkt,
      graph: {} as CytoGraph,
    };
  },
  watch: {
    $route(
      to: RouteLocationNormalizedLoaded,
      from: RouteLocationNormalizedLoaded
    ) {
      console.log(
        'decoded',
        to.path,
        JSON.parse(decodeURI(to.path.split('/').pop() as string))
      );
    },
  },
  methods: {
    loadState: async function (info: {vpn: string; timestamp: number}) {
      console.log('Graph loading state!', info);
      const {vpn, timestamp} = info;
      const response = await axios.get(
        'http://10.212.226.67:3000/api/bmp/state',
        {params: {vpn, timestamp}}
      );
      console.log('Loading done');

      const statePkt: StatePkt = response.data;
      this.currentState = statePkt;

      this.graph = stateToGraph(statePkt);
    },
    filterState: function (filtersRaw: BMPFilter) {
      this.filteredState = _.cloneDeep(this.currentState);

      const filters: BMPFilter = {};
      for (const dimensionString in filtersRaw) {
        const dimension = dimensionString as keyof BMPFilter;
        const filter = filtersRaw[dimension];

        if (
          filter !== undefined &&
          Array.isArray(filter) &&
          filter.length !== 0
        ) {
          filters[dimension] = filtersRaw[dimension];
        }
      }

      for (const vrKey in this.filteredState.state) {
        const vr = this.filteredState.state[vrKey];
        vr.events = vr.events.filter(x => {
          for (const dimensionString in filters) {
            const dimension = dimensionString as keyof BMPFilter;
            const filter = filters[dimension];
            if (filter === undefined) continue;
            if (Array.isArray(x[dimension])) {
              for (const d of x[dimension] as string[]) {
                if (filter.indexOf(d) === -1) {
                  return false;
                }
              }
            } else if (filter.indexOf(x[dimension]) === -1) {
              return false;
            }
          }
          return true;
        });
      }

      console.log(JSON.stringify(filters));
      this.$router.push(encodeURI(JSON.stringify(filters)));

      this.graph = stateToGraph(this.filteredState);
    },
  },
});
</script>

<style>
body {
  margin: 0;
  color: #333;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB';
  overflow-y: hidden;
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

.timeseries {
  background: #e9eef3;
  border-top: #909399 solid 1px;
}

.mac-scroll::-webkit-scrollbar {
  background-color: #fff;
  width: 16px;
}

/* background of the scrollbar except button or resizer */
.mac-scroll::-webkit-scrollbar-track {
  background-color: #fff;
}

/* scrollbar itself */
.mac-scroll::-webkit-scrollbar-thumb {
  background-color: #babac0;
  border-radius: 16px;
  border: 4px solid #fff;
}

/* set button(top and bottom of the scrollbar) */
.mac-scroll::-webkit-scrollbar-button {
  display: none;
}
</style>
