<template>
  <el-form ref="form" :model="form" label-width="120px">
    <el-collapse accordion>
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
          :loading="filtersLoading"
          size="mini"
          placeholder="Select"
          @change="filterData"
        >
          <el-option
            v-for="val of filter.values"
            :key="val"
            :label="val"
            :value="val"
          >
          </el-option>
        </el-select>
        <ElSliderInputs
          v-if="filter.type === 'range'"
          v-model="form[filter.id]"
          input-size="mini"
          :min="filter.values[0]"
          :max="filter.values[1]"
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
      filtersLoading: false,
      filters: [] as {
        id: string;
        title: string;
        active: boolean;
        type: string;
        values: (string | number)[];
      }[],
    };
  },
  watch: {
    currentState() {
      this.filtersLoading = true;
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

      const dimensions: GenericObjSet = {};
      for (const dimension in dimensionsArray) {
        const values = new Set(dimensionsArray[dimension]);
        if (values.size === 1 && [...values][0] === null) continue;
        dimensions[dimension] = values;
      }

      for (const dimension in dimensions) {
        if (dimension === 'id') {
          this.filters.push({
            id: dimension,
            title: _.capitalize(_.lowerCase(dimension)),
            active: false,
            type: 'range',
            values: [
              Math.min(...(dimensions[dimension] as Set<number>)),
              Math.max(...(dimensions[dimension] as Set<number>)),
            ],
          });
        } else {
          this.filters.push({
            id: dimension,
            title: _.capitalize(_.lowerCase(dimension)),
            active: false,
            type: 'select',
            values: [...dimensions[dimension]] as (string | number)[],
          });
        }
      }

      console.log(this.filters);

      this.filtersLoading = false;
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
