<template>
  <el-form ref="form" :model="form" label-width="120px">
    <el-select
      v-model="form.peer_ip"
      filterable
      size="mini"
      placeholder="Select"
    >
      <el-option
        v-for="ip of filters.peer_ips"
        :key="ip"
        :label="ip"
        :value="ip"
      >
      </el-option>
    </el-select>
    <el-button type="primary" @click="filterData" size="mini"
      >Load data</el-button
    >
  </el-form>
</template>

<script lang="ts">
import {defineComponent} from 'vue';

export default defineComponent({
  name: 'FilterRouteMonitor',
  props: {
    filters: Object,
  },
  emits: ['filterData'],
  data() {
    return {
      form: {
        peer_ip: '',
      },
    };
  },
  methods: {
    filterData() {
      if (this.form.peer_ip === '') {
        return;
      }

      const peer_ip = this.form.peer_ip;

      this.$emit('filterData', {
        peer_ip: peer_ip,
      });
    },
  },
});
</script>
