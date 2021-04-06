<template>
  <el-form ref="form" :model="active" label-width="120px">
    <el-collapse>
      <el-collapse-item
        v-for="filter of filters"
        :key="filter.id"
        :name="filter.id"
      >
        <template #title>
          {{ filter.title
          }}<i
            class="header-icon el-icon-s-operation ml-10"
            v-if="filter.active"
          ></i>
        </template>
        <div class="text-center">
          <el-select
            v-if="filter.type === 'select'"
            v-model="active[filter.id]"
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
            v-model="active[filter.id]"
            input-size="mini"
            :min="filter.values[0].sorting"
            :max="filter.values[1].sorting"
            @change="filterDataThrottled"
          ></ElSliderInputs>
        </div>
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

import ElSliderInputs from '@/components/ElSliderInputs.vue';

type basicType = number | string | boolean;

export default defineComponent({
  name: 'FilterRouteMonitor',
  components: {
    ElSliderInputs,
  },
  props: {
    currentState: {
      default: undefined,
      type: Object,
    },
    modelValue: {
      default: undefined,
      type: Object,
    },
  },
  emits: ['update:modelValue'],
  data() {
    return {
      /* Active filters as {dimension: [values selected]}*/
      active: this.$props.modelValue as {[key: string]: string[]},
      filters: [] as {
        id: string;
        title: string;
        active: boolean;
        type: string;
        values: {
          representation: string;
          sorting: basicType;
          original: basicType;
        }[];
      }[],
      filterDataThrottled: _.throttle(this.filterData as () => void, 1000, {
        trailing: true,
      }),
    };
  },
  watch: {
    modelValue() {
      this.active = _.clone(this.modelValue);
    },
    currentState() {
      // if undefined, simply reset all filters and ignore
      if (this.$props.currentState === undefined) {
        this.filters = [];
        return;
      }

      const statePkt = this.$props.currentState as StatePkt;
      /*
       * From the state packet we need to
       * 1. Extract dimensions list
       * 2. For each dimension, extract list of possible values
       * 3. Filter nulls
       * 4. Maybe case
       * 5. Sort values
       * 6. Sort dimensions
       */

      /*
       * 1. Extract dimensions list
       * 2. For each dimension, extract list of possible values
       */
      const dimensionsToValues = {};
      _.mergeWith(
        dimensionsToValues,
        ...statePkt.events,
        (objValue: basicType[], srcV: basicType[]) => {
          const srcValue = Array.isArray(srcV) ? srcV : [srcV];
          if (objValue !== undefined) {
            return [...objValue, ...srcValue];
          } else {
            return srcValue;
          }
        }
      );

      /*
       * 2. Distinct possible values
       */
      const dimensionsToValuesDist = _.mapValues(
        dimensionsToValues,
        (values: basicType[]) => {
          return [...new Set(values)];
        }
      );

      /*
       * 3. Filter nulls
       */
      const dimensionsToValuesDistFiltered = _.pickBy(
        dimensionsToValuesDist,
        (values: basicType[], dimension: string) => {
          // filter [null]
          if (
            values.length === 1 &&
            (values[0] === null || values[0] === undefined)
          )
            return false;
          // filter dimensions deactivated in config
          const ccdim = _.camelCase(dimension);
          const dimensionConf = config[ccdim] || config['DEFAULT CONFIG'];
          if (!dimensionConf.enabled) return false;

          return true;
        }
      );

      const dimensionFilters = _.mapValues(
        dimensionsToValuesDistFiltered,
        (values: basicType[], dimension: string) => {
          const ccdim = _.camelCase(dimension);
          const dimensionConf = config[ccdim] || config['DEFAULT CONFIG'];
          let valuesObj = values.map(x => {
            return {
              representation: x === null ? 'null' : x.toString(),
              sorting:
                dimensionConf.cast === 'parseInt' ? parseInt(x as string) : x,
              original: x,
            };
          });

          if (dimensionConf.type === 'range') {
            const min = _.minBy(valuesObj, x => x.sorting);
            const max = _.maxBy(valuesObj, x => x.sorting);
            if (min !== undefined && max !== undefined) valuesObj = [min, max];
          }

          valuesObj.sort((a, b) => {
            if (a.sorting < b.sorting) return -1;
            else if (a.sorting > b.sorting) return 1;
            return 0;
          });

          return {
            id: dimension,
            title: _.capitalize(_.lowerCase(dimension)),
            active: false,
            type: dimensionConf.type,
            values: valuesObj,
          };
        }
      );

      const filters = Object.values(dimensionFilters);

      filters.sort((a, b) => {
        if (a.id < b.id) return -1;
        else if (a.id > b.id) return 1;
        return 0;
      });

      this.filters = filters;

      this.filterData();
    },
  },
  methods: {
    filterData() {
      if (this.active === undefined) return;

      for (const filter of this.filters) {
        const formElem = this.active[filter.id];
        if (filter.type === 'select') {
          filter.active = formElem.length !== 0;
        } else if (filter.type === 'range') {
          // TODO: check
          console.log('here', formElem, filter.values);
          filter.active =
            formElem !== undefined &&
            (filter.values[0].original !== formElem[0] ||
              filter.values[1].original !== formElem[1]);
        }
      }
      this.$emit('update:modelValue', _.clone(this.active));
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
