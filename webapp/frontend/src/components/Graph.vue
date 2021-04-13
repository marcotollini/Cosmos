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
          <timeseries-chart
            :stateLoaded="stateLoaded"
            :filtersLoaded="filtersLoaded"
          />
        </el-footer>
      </el-container>
    </el-container>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import axios, {CancelTokenSource} from 'axios';
import _ from 'lodash';
import {StatePkt, BMPDump, BMPEvent, CytoGraph} from 'cosmos-lib/src/types';
import VPNTopologyGenerator from '../graph-generator/VPN-topology';
import VPNRoutingTopologyGenerator from '../graph-generator/VPN-routing-topology';

import LoadStateForm from '@/components/LoadStateForm.vue';
import FilterRouteMonitor from '@/components/FilterRouteMonitor.vue';
import Cytoscape from '@/components/Cytoscape.vue';
import TimeseriesChart from '@/components/TimeseriesChart.vue';

type BMPFilter = {
  [key in keyof (BMPDump | BMPEvent)]?: any[];
};
function stateToGraph(
  statePkt: StatePkt,
  vpn: string,
  type: 'load' | 'filter'
) {
  // return VPNRoutingTopologyGenerator(statePkt, vpn, type);
  return VPNTopologyGenerator(statePkt, vpn, type);
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
      // State: list of events
      currentState: undefined as StatePkt | undefined,
      // generated from current state on which we apply filters
      filteredState: undefined as StatePkt | undefined,
      // nodes and edges
      graph: {} as CytoGraph,
      // the state loaded from load-state-form
      stateLoaded: undefined as {vpn: string; datetime: Date} | undefined,
      // the list of filters loaded {dimension: [values selected]}
      filtersLoaded: undefined as BMPFilter | undefined,
      axiosToken: undefined as
        | undefined
        | {token: CancelTokenSource; notification: any},
    };
  },
  watch: {
    async stateLoaded() {
      await this.loadState();
    },
    /*
     * Converts currentState into filteredState by applying the filters
     */
    filtersLoaded() {
      if (this.currentState === undefined) return;
      if (this.filtersLoaded === undefined) return;

      console.log('filtering data');

      const filtersRaw = this.filtersLoaded;
      this.filteredState = _.cloneDeep(this.currentState);

      const filters: BMPFilter = _.pickBy(
        filtersRaw,
        (value: unknown) =>
          value !== undefined && Array.isArray(value) && value.length !== 0
      );

      /*
       * We can have multiple filters, each with multiple selected values.
       * We do an and between filters, but an or between values inside
       * the same filter.
       */
      this.filteredState.events = this.filteredState.events.filter(x => {
        for (const dimensionString in filters) {
          const dimension = dimensionString as keyof BMPFilter;
          // filter: the list of value selected for a given dimension
          const filter = filters[dimension];
          if (filter === undefined) continue;
          if (x[dimension] === null) return;
          const values = (Array.isArray(x[dimension])
            ? x[dimension]
            : [x[dimension]]) as any[];
          const valsFilt = values.filter(value => filter.indexOf(value) !== -1);

          if (valsFilt.length === 0) {
            return false;
          }
        }
        return true;
      });

      if (this.stateLoaded === undefined) return;

      this.graph = stateToGraph(
        this.filteredState,
        this.stateLoaded.vpn,
        'filter'
      );

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
      if (this.stateLoaded === undefined) return;
      const {vpn, datetime} = this.stateLoaded;

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
      const start = new Date().getTime();
      const response = await axios.get(
        'http://10.212.226.67:3000/api/bmp/state',
        {params: {vpn, timestamp}, cancelToken: axiosToken.token}
      );
      const end = new Date().getTime();
      console.log('loading graph took', (end - start) / 1000);

      this.axiosToken = undefined;

      const statePkt: StatePkt = response.data;
      this.currentState = statePkt;

      if (this.stateLoaded === undefined) return;

      this.graph = stateToGraph(statePkt, this.stateLoaded.vpn, 'load');

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
