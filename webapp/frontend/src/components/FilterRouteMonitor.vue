<template>
  <el-form ref="form" :model="form" label-width="120px">
    <el-collapse>
      <el-collapse-item
        v-for="filter of filters"
        v-bind:key="filter.title"
        :name="filter.id"
      >
        <template #title>
          {{ filter.title
          }}<i
            class="header-icon el-icon-s-operation ml-10"
            v-if="filter.active"
          ></i>
        </template>
        <el-select
          v-if="filter.type === 'select'"
          v-model="form[filter.id]"
          clearable
          filterable
          allow-create
          multiple
          size="mini"
          placeholder="Select"
          @change="filterData"
        >
          <el-option
            v-for="val of filter.values"
            :key="val.original"
            :label="val.rep"
            :value="val.original"
          >
          </el-option>
        </el-select>
        <ElSliderInputs
          v-if="filter.type === 'range'"
          v-model="form[filter.id]"
          input-size="mini"
          :min="filter.values[0].sorting"
          :max="filter.values[1].sorting"
          @change="filterData"
        ></ElSliderInputs>
      </el-collapse-item>
    </el-collapse>
  </el-form>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {StatePkt} from 'cosmos-lib/src/types';
import _ from 'lodash';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require('../filter.json');

interface GenericObjArray {
  [key: string]: unknown[];
}
interface GenericObjSet {
  [key: string]: Set<unknown>;
}

import ElSliderInputs from '@/components/ElSliderInputs.vue';

export default defineComponent({
  name: 'FilterRouteMonitor',
  components: {
    ElSliderInputs,
  },
  props: {
    currentState: {},
  },
  emits: ['filterData'],
  data() {
    return {
      form: {} as {[key: string]: any},
      filters: [] as {
        id: string;
        title: string;
        active: boolean;
        type: string;
        values: {rep: string; sorting: any; original: any}[];
      }[],
    };
  },
  watch: {
    currentState() {
      const statePkt = this.$props.currentState as StatePkt;

      const dimensionsArray: GenericObjArray = {};

      for (const vrKey in statePkt.state) {
        const events = statePkt.state[vrKey].events;
        for (const event of events) {
          for (const key in event) {
            const e = (event as unknown) as GenericObjArray;
            if (!dimensionsArray[key]) dimensionsArray[key] = [];

            if (Array.isArray(e[key])) dimensionsArray[key].push(...e[key]);
            else dimensionsArray[key].push(e[key]);
          }
        }
      }

      const dimensions: GenericObjArray = {};
      for (const dimension in dimensionsArray) {
        const values = new Set(dimensionsArray[dimension]);
        if (values.size === 1 && [...values][0] === null) continue;
        dimensions[dimension] = [...values];
      }

      for (const dimension in dimensions) {
        const ccdim = _.camelCase(dimension);
        const dimensionConf = config[ccdim] || config['DEFAULT CONFIG'];
        if (!dimensionConf.enabled) continue;

        let values = dimensions[dimension].map(x => {
          return {
            rep: x === null ? 'null' : (x as any).toString(),
            sorting: x,
            original: x,
          };
        }) as {rep: string; sorting: any; original: any}[];

        // maybe cast
        if (dimensionConf.cast && dimensionConf.cast === 'parseInt') {
          values = values.map(x => {
            return {
              rep: x.rep,
              sorting: parseInt(x.sorting as string),
              original: x.original,
            };
          });
        }

        if (dimensionConf.type === 'range') {
          const min = _.minBy(values, x => x.sorting);
          const max = _.maxBy(values, x => x.sorting);
          if (min === undefined || max === undefined) {
            console.log('not sure what do here');
            continue;
          }
          values = [min, max];
        }

        values.sort((a, b) => {
          if (a.sorting < b.sorting) return -1;
          else if (a.sorting > b.sorting) return 1;
          return 0;
        });

        const filter = {
          id: dimension,
          title: _.capitalize(_.lowerCase(dimension)),
          active: false,
          type: dimensionConf.type,
          values: values,
        };

        this.filters.push(filter);
      }

      this.filters.sort((a, b) => {
        if (a.id < b.id) return -1;
        else if (a.id > b.id) return 1;
        return 0;
      });
    },
  },
  methods: {
    filterData() {
      console.log('filterdata', this.form);
      for (const filter of this.filters) {
        const formElem = this.form[filter.id];
        if (filter.type === 'select') {
          filter.active = formElem.length !== 0;
        } else if (filter.type === 'range') {
          filter.active =
            filter.values[0] !== formElem[0] ||
            filter.values[1] !== formElem[1];
        }
      }
      // if (this.form.peer_ip === '') {
      //   return;
      // }
      // const peer_ip = this.form.peer_ip;
      // this.$emit('filterData', {
      //   peer_ip: peer_ip,
      // });
    },
  },
});
</script>

<style>
.el-collapse-item__header {
  padding-left: 10px;
  height: 30px !important;
}

.el-collapse-item__wrap {
  padding-left: 10px;
  padding-right: 10px;
}

.ml-10 {
  margin-left: 10px;
}
</style>
