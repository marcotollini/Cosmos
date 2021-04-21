<template>
  <el-popover
    placement="right"
    :width="250"
    trigger="click"
    v-model:visible="popoverOpen"
  >
    <template #reference>
      <el-badge :value="selectedValues.length" class="item">
        <el-tag effect="dark" closable @close="tagDelete">
          <slot></slot>
        </el-tag>
      </el-badge>
    </template>
    <div ref="tabs">
      <el-tabs v-model="tabActive">
        <el-tab-pane label="Filter" name="filter">
          <el-input
            placeholder="Search"
            v-model="searchValue"
            clearable
            size="mini"
          >
          </el-input>
          <div class="buttons-selection">
            <el-button size="mini" @click="selectVisible"
              >select visible</el-button
            >
            <el-button size="mini" @click="deselectVisible"
              >deselect visible</el-button
            >
          </div>
          <ul class="filter-popover">
            <el-checkbox-group v-model="selectedValues">
              <li v-for="value in filteredShowValues" :key="value">
                <el-checkbox :label="value">{{ value }}</el-checkbox>
              </li>
            </el-checkbox-group>
          </ul>
        </el-tab-pane>
        <el-tab-pane label="Active Filters" name="active">
          <el-checkbox-group v-model="selectedValues">
            <li v-for="value in selectedValues" :key="value">
              <el-checkbox :label="value">{{ value }}</el-checkbox>
            </li>
          </el-checkbox-group>
        </el-tab-pane>
      </el-tabs>
    </div>
  </el-popover>
</template>

<script lang="ts">
import {uniq} from 'lodash';
import {defineComponent} from 'vue';

export default defineComponent({
  name: 'FiltersPlacable',
  props: {
    // to avoid warning from draggable. Useless to us
    'data-draggable': {},
    values: {
      default: () => [],
      type: Array,
    },
    selected: {
      default: () => [],
      type: Array,
    },
    open: {
      default: true,
      type: Boolean,
    },
    loading: {
      default: false,
      type: Boolean,
    },
  },
  emits: ['open', 'close', 'delete', 'update:selected'],
  data() {
    return {
      popoverOpen: false as boolean,
      tabActive: 'filter' as string,
      searchValue: '' as string,
      selectedValues: [] as string[],
      loadingObject: undefined as any,
    };
  },
  computed: {
    valuesSet() {
      const values = this.values as string[] | undefined;
      if (values !== undefined) {
        return new Set(values);
      }
      return new Set();
    },
    userDefinedValues(): string[] {
      return this.selectedValues.filter((x: string) => !this.valuesSet.has(x));
    },
    showValues(): string[] {
      const values = this.values === undefined ? [] : (this.values as string[]);
      if (
        this.searchValue !== '' &&
        this.userDefinedValues.indexOf(this.searchValue) === -1 &&
        values.indexOf(this.searchValue) === -1
      ) {
        return [this.searchValue, ...this.userDefinedValues, ...values];
      }
      return [...this.userDefinedValues, ...values];
    },

    filteredShowValues(): string[] {
      if (this.searchValue !== '') {
        const searchValue = this.searchValue.toLowerCase();
        return this.showValues.filter(
          x => x.toLowerCase().indexOf(searchValue) !== -1
        );
      }
      return this.showValues;
    },
  },
  watch: {
    open() {
      this.popoverOpen = this.open;
    },
    popoverOpen() {
      if (this.popoverOpen) {
        this.$emit('open');
      } else {
        this.$emit('close');
      }
    },
    selected() {
      this.syncSelected();
    },
    selectedValues() {
      this.$emit('update:selected', this.selectedValues);
    },
    loading() {
      this.toggleLoading();
    },
  },
  methods: {
    tagDelete() {
      this.$emit('delete');
    },
    syncSelected() {
      const selected = this.selected as string[] | undefined;
      if (selected !== undefined) {
        this.selectedValues = selected;
      } else {
        this.selectedValues = [];
      }
    },
    selectVisible() {
      this.selectedValues = uniq([
        ...this.selectedValues,
        ...this.filteredShowValues,
      ]);
    },
    deselectVisible() {
      this.selectedValues = this.selectedValues.filter(
        x => this.filteredShowValues.indexOf(x) === -1
      );
    },
    showLoading() {
      const elem = this.$refs.tabs;
      this.loadingObject = this.$loading({
        target: elem,
        lock: true,
      });
    },
    hideLoading() {
      if (this.loadingObject !== undefined) {
        this.loadingObject.close();
        this.loadingObject = undefined;
      }
    },
    toggleLoading() {
      if (this.loading && this.loadingObject === undefined) {
        this.showLoading();
      } else if (!this.loading && this.loadingObject !== undefined) {
        this.hideLoading();
      }
    },
  },
  mounted() {
    this.popoverOpen = this.open;
    this.toggleLoading();
    this.syncSelected();
  },
});
</script>

<style scoped>
.el-tag {
  margin: 5px;
}

ul {
  padding-left: 10px;
}

.buttons-selection {
  text-align: center;
  margin-top: 10px;
}

.filter-popover {
  max-height: 300px;
  overflow-y: auto;
}
</style>

<style>
.el-badge__content.is-fixed {
  top: 5px !important;
  right: 15px !important;
}
</style>
