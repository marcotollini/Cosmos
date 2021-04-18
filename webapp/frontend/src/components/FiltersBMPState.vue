<template>
  <el-form ref="form" label-width="120px">
    <el-collapse>
      <el-collapse-item
        v-for="filterName of Object.keys(fieldValuesList)"
        :key="filterName"
        :name="filterName"
      >
        <template #title>
          {{ filterName
          }}<i
            v-if="activeFilters[filterName]"
            class="header-icon el-icon-s-operation ml-10"
          ></i>
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
            @change="activeFiltersChange(filterName)"
          >
            <el-option
              v-for="val of fieldValuesList[filterName]"
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
      /* List of fields, and the possible values */
      fieldValuesList: {} as Record<string, unknown[]>,
      /* List of fields, and a true if the possible values are loading, otherwie undefined (or false) */
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
      this.fieldValuesList = {};
      this.loadFieldsValues();
    },

    selectedVPN() {
      this.fieldValuesList = {};
      this.loadFieldsValues();
    },
  },
  methods: {
    /**
     * Called when a user changes an input field
     * focusFieldName is the field name that triggered the event
     * This function triggers the re-loading of all the filters
     * and their values
     */
    async activeFiltersChange(focusFieldName?: string) {
      // notify chanege
      const temp = this.activeFilters;
      this.activeFilters = temp;

      this.loadFieldsValues(focusFieldName);
    },

    /**
     * Called when we want to redownload the possible values in the filter
     * focusFieldName will not be reset nor set loading, all the others will
     */
    async loadFieldsValues(focusFieldName?: string) {
      const timestamp = this.selectedTimestamp;
      const vpn = this.selectedVPN;
      if (timestamp === undefined || vpn === undefined) return;

      for (const fieldName in this.fieldValuesList) {
        if (focusFieldName === fieldName) continue;
        this.fieldValuesList[fieldName] = [];
        this.fieldLoading[fieldName] = true;
      }

      try {
        const result = await this.$http.get('/api/bmp/filter/fields/values', {
          params: {timestamp, vpn},
          headers: {
            REQUEST_ID: 'field_values',
            THROTTLE: '1000',
            CANCEL: 'true',
          },
        });

        const fieldsValues = result.data as {
          key: string;
          values: (string | number | boolean | null)[];
        }[];

        const fieldsValuesObj = {} as Record<string, unknown[]>;
        for (const val of fieldsValues) {
          fieldsValuesObj[val.key] = val.values;
        }

        this.fieldValuesList = fieldsValuesObj;
        this.fieldLoading = {};
      } catch (e) {
        if (e.__CANCEL__) {
          console.log('Request cancelled');
        } else if (e.name === 'REQABORTTHROTTLE') {
          console.log('request aborted due to throttle policy');
        } else {
          console.error(e.stack, e);
        }
      } finally {
        this.fieldLoading = {};
      }
    },
  },
  mounted() {
    /**
     * Used to trigger the clean-up of the fieldValuesList (see store.mutations.activeFilters)
     * It also loads the filters and the values
     */
    this.activeFiltersChange();
  },
});
</script>

<style>
.el-collapse-item__header {
  padding-left: 10px;
  height: 30px !important;
}
</style>
