<template>
  <div ref="timeseries" style="width: 100%; height: 100%">
    <apexchart
      type="line"
      :height="height"
      :options="options"
      :series="series"
    ></apexchart>
  </div>
</template>

<script lang="ts">
import {isEmpty} from 'lodash';
import {defineComponent} from 'vue';

// eslint-disable-next-line @typescript-eslint/ban-types
function doubleClick(timer: number, fn: Function) {
  let timeout = undefined as any;
  return function click(...args: unknown[]) {
    if (timeout !== undefined) {
      timeout = undefined;
      return fn(...args);
    }

    timeout = setTimeout(() => {
      timeout = undefined;
    }, timer);
  };
}

export default defineComponent({
  name: 'TimeseriesChart',
  props: {
    height: {
      default: 200,
      type: Number,
    },
  },
  data() {
    return {
      options: {
        chart: {
          type: 'line',
          stacked: false,
          foreColor: '#999',
          events: {
            markerClick: doubleClick(500, this.markerDoubleClick),
          },
        },
        colors: ['#FF1654', '#247BA0'],
        stroke: {
          width: [3, 3],
          curve: 'smooth',
        },
        dataLabels: {
          enabled: false,
        },
        noData: {
          text: 'No data loaded',
        },
        xaxis: {
          type: 'datetime',
          labels: {
            datetimeUTC: false,
          },
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
          tooltip: {
            enabled: false,
          },
        },
        yaxis: {
          labels: {
            offsetX: -10,
            offsetY: -3,
          },
          tooltip: {
            enabled: false,
          },
        },
        grid: {
          yaxis: {
            lines: {
              show: true,
            },
          },
          xaxis: {
            lines: {
              show: true,
            },
          },
          padding: {
            left: -5,
            right: 5,
          },
        },
        tooltip: {
          x: {
            format: 'HH:mm dd MMM yyyy',
          },
        },
        legend: {
          position: 'top',
          horizontalAlign: 'left',
        },
        annotations: {
          xaxis: [
            {
              x: new Date().getTime(),
              borderColor: '#00E396',
              label: {
                borderColor: '#00E396',
                style: {
                  color: '#fff',
                  background: '#00E396',
                },
                text: 'Current',
              },
            },
          ],
        },
      },
      allSeries: [] as {start_bucket: number; count: number}[],
      filteredSeries: [] as {start_bucket: number; count: number}[],
      precision: 60,
      loadingObject: undefined as any,
    };
  },

  computed: {
    showLoading(): boolean {
      return this.$store.state.showLoading;
    },
    allSeriesApex(): [Date, number][] {
      return this.allSeries.map(x => [
        new Date(x.start_bucket * 1000),
        Math.round(x.count / this.precision),
      ]);
    },
    filteredSeriesApex(): [Date, number][] {
      return this.filteredSeries.map(x => [
        new Date(x.start_bucket * 1000),
        Math.round(x.count / this.precision),
      ]);
    },
    series() {
      return [
        {name: 'All', data: this.allSeriesApex},
        {name: 'Filtered', data: this.filteredSeriesApex},
      ];
    },
    selectedTimestamp(): Date | undefined {
      return this.$store.state.selectedTimestamp;
    },
    selectedVPN(): string | undefined {
      return this.$store.state.selectedVPN;
    },
    activeFilters(): Record<string, unknown[]> {
      return this.$store.state.activeFilters;
    },
  },
  watch: {
    selectedTimestamp() {
      this.loadAll();
      this.loadFilters();
    },
    selectedVPN() {
      this.loadAll();
      this.loadFilters();
    },
    activeFilters() {
      this.loadFilters();
    },
  },
  methods: {
    markerDoubleClick(
      event: MouseEvent,
      chartContext: unknown,
      {
        seriesIndex,
        dataPointIndex,
        config,
      }: {seriesIndex: number; dataPointIndex: number; config: unknown}
    ) {
      if (dataPointIndex >= this.allSeries.length) {
        console.log(
          'Cannot set timestamp from timeline as index > allSeries.length',
          dataPointIndex,
          this.allSeries.length
        );
        return;
      }
      const timestamp = this.allSeries[dataPointIndex].start_bucket;
      const datetime = new Date(timestamp * 1000);
      this.$store.commit('selectedTimestamp', datetime);
    },
    setMarker(time: Date) {
      this.options.annotations.xaxis[0].x = time.getTime();
    },
    startLoading() {
      if (this.loadingObject !== undefined) {
        this.loadingObject.close();
        this.loadingObject = undefined;
      }

      if (this.showLoading) {
        this.loadingObject = this.$loading({
          target: this.$refs.timeseries,
          lock: true,
        });
      }
    },
    stopLoading() {
      if (this.loadingObject !== undefined) {
        this.loadingObject.close();
        this.loadingObject = undefined;
      }
    },
    async loadAll() {
      const timestamp = this.selectedTimestamp;
      const vpn = this.selectedVPN;
      if (timestamp === undefined || vpn === undefined)
        return (this.allSeries = []);

      if (this.allSeries.length > 0) {
        const min = this.allSeries[0];
        const max = this.allSeries[this.allSeries.length - 1];
        if (
          timestamp.getTime() / 1000 > max.start_bucket ||
          timestamp.getTime() / 1000 < min.start_bucket
        ) {
          this.allSeries = [];
        } else {
          this.setMarker(timestamp);
        }
      }

      this.startLoading();

      const result = await this.$http.post('/api/bmp/count', {
        data: {timestamp, vpn, filters: {}},
        headers: {
          REQUEST_ID: 'counter_all',
          THROTTLE: '1000',
          CANCEL: 'true',
        },
      });
      const data = result.data as {start_bucket: number; count: number}[];

      this.allSeries = data;
      this.setMarker(timestamp);
      this.stopLoading();
    },
    async loadFilters() {
      const timestamp = this.selectedTimestamp;
      const vpn = this.selectedVPN;
      if (
        timestamp === undefined ||
        vpn === undefined ||
        isEmpty(this.activeFilters)
      )
        return (this.filteredSeries = []);

      if (this.filteredSeries.length > 0) {
        const min = this.filteredSeries[0];
        const max = this.filteredSeries[this.filteredSeries.length - 1];
        if (
          timestamp.getTime() / 1000 > max.start_bucket ||
          timestamp.getTime() / 1000 < min.start_bucket
        ) {
          this.filteredSeries = [];
        } else {
          this.setMarker(timestamp);
        }
      }
      this.startLoading();

      const result = await this.$http.post('/api/bmp/count', {
        data: {timestamp, vpn, filters: this.activeFilters},
        headers: {
          REQUEST_ID: 'counter_filters',
          THROTTLE: '1000',
          CANCEL: 'true',
        },
      });
      const data = result.data as {start_bucket: number; count: number}[];

      this.filteredSeries = data;
      this.setMarker(timestamp);
      this.stopLoading();
    },
  },
  mounted() {
    this.loadAll();
  },
});
</script>

<style scoped>
.vue-apexcharts {
  min-height: 10px !important;
}
.apexcharts-toolbar {
  opacity: 1;
  border: 0;
}
</style>
