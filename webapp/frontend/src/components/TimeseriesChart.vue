<template>
  <apexchart
    type="line"
    height="184px"
    :options="options"
    :series="series"
  ></apexchart>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import axios from 'axios';

function generateDayWiseTimeSeries(s: number, count: number) {
  const values = [
    [4, 3, 10, 9, 29, 19, 25, 9, 12, 7, 19, 5, 13, 9, 17, 2, 7, 5],
    [2, 3, 8, 7, 22, 16, 23, 7, 11, 5, 12, 5, 10, 4, 15, 2, 6, 2],
  ];
  let i = 0;
  const series = [];
  while (i < count) {
    series.push([new Date(`${i + 1} Nov 2012`), values[s][i]]);
    i++;
  }
  // console.log(series);
  return series;
}

export default defineComponent({
  name: 'TimeseriesChart',
  props: {},
  emits: [],
  data() {
    return {
      series: [
        {
          name: 'Total Views',
          data: generateDayWiseTimeSeries(0, 18),
        },
        {
          name: 'Unique Views',
          data: generateDayWiseTimeSeries(1, 18),
        },
      ],
      options: {
        chart: {
          type: 'area',
          height: 300,
          foreColor: '#999',
          stacked: true,
          dropShadow: {
            enabled: true,
            enabledSeries: [0],
            top: -2,
            left: 2,
            blur: 5,
            opacity: 0.06,
          },
          events: {
            // click: function (
            //   event: MouseEvent,
            //   chartContext: unknown,
            //   config: unknown
            // ) {
            //   console.log('click', event, chartContext, config);
            // },
            selection: function (
              chartContext: unknown,
              {xaxis, yaxis}: unknown
            ) {
              console.log('selection', chartContext, xaxis, yaxis);
            },
            dataPointSelection: function (
              event: MouseEvent,
              chartContext: unknown,
              config: unknown
            ) {
              console.log(this.dataPointSelection, config);
            },
          },
        },
        colors: ['#00E396', '#0090FF'],
        stroke: {
          curve: 'smooth',
          width: 3,
        },
        dataLabels: {
          enabled: false,
        },
        series: [
          {
            name: 'Total Views',
            data: generateDayWiseTimeSeries(0, 18),
          },
          {
            name: 'Unique Views',
            data: generateDayWiseTimeSeries(1, 18),
          },
        ],
        markers: {
          size: 0,
          strokeColor: '#fff',
          strokeWidth: 3,
          strokeOpacity: 1,
          fillOpacity: 1,
          hover: {
            size: 6,
          },
        },
        xaxis: {
          type: 'datetime',
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
        },
        yaxis: {
          labels: {
            offsetX: 14,
            offsetY: -5,
          },
          tooltip: {
            enabled: true,
          },
        },
        grid: {
          padding: {
            left: -5,
            right: 5,
          },
        },
        tooltip: {
          x: {
            format: 'dd MMM yyyy',
          },
          // intersect: true,
          // shared: false,
        },
        legend: {
          position: 'top',
          horizontalAlign: 'left',
        },
        fill: {
          type: 'solid',
          fillOpacity: 0.7,
        },
      },
    };
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
