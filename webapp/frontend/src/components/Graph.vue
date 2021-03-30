<template>
  <div class="graph">
    <el-container class="el-container-global">
      <el-aside width="20%">
        <el-container class="el-container-global">
          <el-main style="border-right: 1px #909399 solid" class="mac-scroll">
            <div class="side-top">
              <load-state-form
                v-on:load-data="loadState"
                v-model="stateLoaded"
                style="margin-bottom: 10px"
              />
              <filter-route-monitor
                :currentState="currentState"
                v-model="filtersLoaded"
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
import axios, {CancelToken, CancelTokenSource} from 'axios';
import _ from 'lodash';
import {StatePkt, BMPDump, BMPEvent} from 'cosmos-lib/src/types';
import {CytoGraph} from '../types';

import LoadStateForm from '@/components/LoadStateForm.vue';
import FilterRouteMonitor from '@/components/FilterRouteMonitor.vue';
import Cytoscape from '@/components/Cytoscape.vue';
import TimeseriesChart from '@/components/TimeseriesChart.vue';
import {RouteLocationNormalizedLoaded} from 'vue-router';

type BMPFilter = {
  [key in keyof (BMPDump | BMPEvent)]?: any[];
};
function stateToGraph(statePkt: StatePkt, type: 'load' | 'filter') {
  const graph: CytoGraph = {
    nodes: {},
    edges: {},
    type,
  };

  for (const event of statePkt.events) {
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

  return graph;
}

function datetimeToString(datetime: Date) {
  const padding = _.partialRight(_.padStart, 2, '0');
  const year = padding(datetime.getFullYear().toString());
  const month = padding((datetime.getMonth() + 1).toString());
  const day = padding(datetime.getDate().toString());
  const hour = padding(datetime.getHours().toString());
  const minute = padding(datetime.getMinutes().toString());
  const second = padding(datetime.getSeconds().toString());
  return `${year}-${month}-${day} at ${hour}:${minute}:${second}`;
}

export default defineComponent({
  name: 'Graph',
  components: {
    LoadStateForm,
    FilterRouteMonitor,
    Cytoscape,
    TimeseriesChart,
  },
  data() {
    return {
      currentState: {} as StatePkt,
      filteredState: {} as StatePkt,
      graph: {} as CytoGraph,
      stateLoaded: {} as {vpn: number; datetime: Date},
      filtersLoaded: {} as BMPFilter,
      axiosToken: undefined as
        | undefined
        | {token: CancelTokenSource; notification: any},
    };
  },
  watch: {
    async stateLoaded() {
      await this.loadState();
    },
    $route(
      to: RouteLocationNormalizedLoaded,
      from: RouteLocationNormalizedLoaded
    ) {
      try {
        const parameters = JSON.parse(atob(to.path.split('/').pop() as string));
        console.log(parameters);
      } catch (e) {
        this.$router.push('/');
      }
    },

    filtersLoaded() {
      if (this.currentState.timestamp === undefined) return;
      const filtersRaw = this.filtersLoaded;
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

      this.filteredState.events = this.filteredState.events.filter(x => {
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

      this.graph = stateToGraph(this.filteredState, 'filter');

      this.$router.push(
        btoa(
          JSON.stringify({
            data: this.stateLoaded,
            filters: this.filtersLoaded,
          })
        )
      );
    },
  },

  methods: {
    async loadState() {
      const {vpn, datetime} = this.stateLoaded;
      console.log(vpn, datetime);

      // If there is another request for loading, cancel it
      if (this.axiosToken !== undefined) {
        this.axiosToken.token.cancel();
        this.axiosToken.notification.close();
        this.$notify({
          title: 'Loading graph',
          message: 'Cancelling previous request',
          type: 'error',
          customClass: 'text-left',
          duration: 3000,
        });

        // process.nextTick in a fancy way with await :)
        // needed for notify to work correctly, otherwise
        // popups are overlapping
        await Promise.resolve();
      }

      // Notify about the new request
      const loadingNotification = this.$notify({
        title: 'Loading graph',
        message: `Loading the data for vpn ${vpn} and date ${datetimeToString(
          datetime
        )}`,
        iconClass: 'el-icon-loading',
        customClass: 'text-left',
        duration: 0,
      });

      // timestamp in seconds
      const timestamp = Math.floor(datetime.getTime() / 1000);
      const axiosToken = axios.CancelToken.source();
      this.axiosToken = {token: axiosToken, notification: loadingNotification};
      const response = await axios.get(
        'http://10.212.226.67:3000/api/bmp/state',
        {params: {vpn, timestamp}, cancelToken: axiosToken.token}
      );

      this.axiosToken = undefined;

      const statePkt: StatePkt = response.data;
      this.currentState = statePkt;

      this.graph = stateToGraph(statePkt, 'load');

      loadingNotification.close();
      this.$notify({
        title: 'Loading graph',
        message: `Completed loading of the data for vpn ${vpn} and date ${datetimeToString(
          datetime
        )}`,
        type: 'success',
        duration: 3000,
      });

      this.$router.push(
        btoa(
          JSON.stringify({
            data: this.stateLoaded,
            filters: this.filtersLoaded,
          })
        )
      );
    },
  },
  mounted() {
    try {
      const splitted = this.$route.path.split('/').pop() as string;
      if (splitted === '') return;
      const parameters = JSON.parse(atob(splitted));
      const data = {
        vpn: parameters.data.vpn,
        datetime: new Date(parameters.data.datetime),
      };
      this.stateLoaded = data;
      this.filtersLoaded = parameters.filters;
    } catch (e) {
      console.log(e);
      this.$router.push('/');
    }
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

.side-elem-width {
  width: 95% !important;
  margin-top: 5px;
}

.text-center {
  text-align: center;
}

.text-left .el-notification__content p {
  text-align: left !important;
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
