<template>
  <el-form ref="form" label-width="120px">
    <el-collapse>
      <el-collapse-item
        v-for="filterName of fieldList"
        :key="filterName"
        :name="filterName"
      >
        <template #title>
          {{ filterName }}<i class="header-icon el-icon-s-operation ml-10"></i>
        </template>
        <div class="text-center">
          <el-select
            v-model="activeFilters[filterName]"
            clearable
            filterable
            allow-create
            multiple
            size="mini"
            placeholder="Select"
            :name="filterName"
            :loading="fieldLoading[filterName]"
            @change="activeFiltersChange"
            @focus="focusFiltersChange"
            @blur="blurFiltersChange"
          >
            <el-option
              v-for="val of fieldValueList[filterName]"
              :key="val"
              :label="val"
              :value="val"
            >
            </el-option>
          </el-select>
        </div>
      </el-collapse-item>
    </el-collapse>
  </el-form>
</template>

<script lang="ts">
import {defineComponent} from 'vue';

export default defineComponent({
  name: 'FiltersBMPState',
  data() {
    return {
      fieldList: ['BMP', 'Router'] as string[],
      fieldValueList: {} as Record<string, []>,
      fieldLoading: {} as Record<string, boolean>,
    };
  },
  computed: {
    selectedTimestamp() {
      return this.$store.state.selectedTimestamp;
    },

    selectedVPN() {
      return this.$store.state.selectedVPN;
    },

    activeFilters: {
      get() {
        return this.$store.state.activeFilters;
      },
      set(newValue) {
        this.$store.commit('activeFilters', newValue);
      },
    },
  },
  watch: {
    selectedTimestamp() {
      this.loadFieldList();
    },

    selectedVPN() {
      this.loadFieldList();
    },
  },
  methods: {
    activeFiltersChange() {
      // notify chanege
      const temp = this.activeFilters;
      this.activeFilters = temp;
    },

    async loadFieldList() {
      const timestamp = this.selectedTimestamp;
      const vpn = this.selectedVPN;
      if (timestamp === undefined || vpn === undefined) return;
      try {
        const result = await this.$http.get('/api/bmp/filter/field/list', {
          params: {timestamp, vpn},
          headers: {
            REQUEST_ID: 'field_list',
            THROTTLE: '1000',
            CANCEL: 'true',
          },
        });

        const fieldList = result.data as string[];
        fieldList.sort();
        this.fieldList = fieldList;
      } catch (e) {
        if (e.__CANCEL__) {
          console.log('Request cancelled');
        } else if (e.name === 'REQABORTTHROTTLE') {
          console.log('request aborted due to throttle policy');
        } else {
          // console.error(e.stack, e);
        }
      }
    },
  },
});
</script>

<style>
.el-collapse-item__header {
  padding-left: 10px;
  height: 30px !important;
}
</style>
