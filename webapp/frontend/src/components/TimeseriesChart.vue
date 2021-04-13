<template>
  <apexchart
    type="line"
    height="190px"
    :options="options"
    :series="series"
  ></apexchart>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import axios, {CancelTokenSource} from 'axios';
import _ from 'lodash';
import {EventCount} from 'cosmos-lib/src/types';

function dateToSeconds(date: Date) {
  return Math.floor(date.getTime() / 1000);
}

export default defineComponent({
  name: 'TimeseriesChart',
  props: {
    stateLoaded: {
      default: undefined,
      type: Object,
    },
    filtersLoaded: {
      default: undefined,
      type: Object,
    },
  },
  data() {
    return {
      series: undefined as
        | {
            name: string;
            data: (number | Date)[][];
          }[]
        | undefined,
      options: {
        chart: {
          type: 'line',
          stacked: false,
          foreColor: '#999',
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
              x: new Date(new Date().getTime() - 30 * 60 * 1000).getTime(),
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
      axiosToken: undefined as CancelTokenSource | undefined,
    };
  },
  watch: {
    stateLoaded() {
      this.countEvents();
    },
    filtersLoaded() {
      if (this.stateLoaded === undefined) return;
      const stateLoaded = this.stateLoaded as {vpn: string; datetime: Date};
      const activeFilters = _.pickBy(this.filtersLoaded, (value: []) => {
        return value.length > 0;
      });

      if (Object.keys(activeFilters).length === 0) return;
      // console.log(activeFilters);

      const stateTimestamp = new Date(
        stateLoaded.datetime.getTime() - 1 * 24 * 60 * 60 * 1000
      );

      const endTimestamp = new Date(
        stateLoaded.datetime.getTime() + 1 * 24 * 60 * 60 * 1000
      );

      const params = {
        startTimestamp: dateToSeconds(stateTimestamp),
        endTimestamp: dateToSeconds(endTimestamp),
        precision: 60,
        approximation: false,
        filter: activeFilters,
      };

      axios
        .get('http://10.212.226.67:3000/api/bmp/count', {
          params,
        })
        .then(response => {
          const data = response.data as EventCount[];
          const countList = data.map(x => {
            const secondInt = (x.end_bucket - x.start_bucket) / 2;
            return [
              new Date((x.start_bucket + secondInt) * 1000),
              Math.round(x.count / secondInt),
            ];
          });
          this.setSeriesFiltered(countList);
          // this.setMarker(this.stateLoaded.datetime);
        })
        .catch(e => {
          if (axios.isCancel(e)) {
            console.log('Request canceled', e.message);
          } else {
            throw e;
          }
        })
        .finally(() => {
          // this.isLoadingVpnList = false;
        });
    },
  },
  methods: {
    setMarker(time: Date) {
      const options = _.clone(this.options);
      options.annotations.xaxis[0].x = time.getTime();
      this.options = options;
    },
    setSeries(index: number, list: (number | Date)[][]) {
      const series = this.series
        ? _.clone(this.series)
        : [
            {
              name: 'All',
              data: [],
            },
            {
              name: 'Filtered',
              data: [],
            },
          ];
      series[index].data = list;
      this.series = series;
    },
    setSeriesAll(list: (number | Date)[][]) {
      this.setSeries(0, list);
    },
    setSeriesFiltered(list: (number | Date)[][]) {
      this.setSeries(1, list);
    },
    countEvents(filters?: any[]) {
      if (this.stateLoaded === undefined) return;
      const stateLoaded = this.stateLoaded as {vpn: string; datetime: Date};
      if (this.axiosToken !== undefined) {
        this.axiosToken.cancel();
      }
      this.axiosToken = axios.CancelToken.source();

      const stateTimestamp = new Date(
        stateLoaded.datetime.getTime() - 1 * 24 * 60 * 60 * 1000
      );

      const endTimestamp = new Date(
        stateLoaded.datetime.getTime() + 1 * 24 * 60 * 60 * 1000
      );

      const params = {
        startTimestamp: dateToSeconds(stateTimestamp),
        endTimestamp: dateToSeconds(endTimestamp),
        precision: 60,
        approximation: false,
      };

      axios
        .get('http://10.212.226.67:3000/api/bmp/count', {
          params,
          cancelToken: this.axiosToken.token,
        })
        .then(response => {
          const data = response.data as EventCount[];
          const countList = data.map(x => {
            const secondInt = x.end_bucket - x.start_bucket;
            return [
              new Date(x.start_bucket * 1000),
              Math.round(x.count / secondInt),
            ];
          });
          this.setSeriesAll(countList);
          this.setMarker(this.stateLoaded.datetime);
        })
        .catch(e => {
          if (axios.isCancel(e)) {
            console.log('Request canceled', e.message);
          } else {
            throw e;
          }
        })
        .finally(() => {
          // this.isLoadingVpnList = false;
        });
    },
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
