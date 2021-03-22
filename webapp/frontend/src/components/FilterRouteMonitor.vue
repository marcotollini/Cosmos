<template>
  <h1>{{ testpro }}</h1>
  <el-form ref="form" :model="form" label-width="120px">
    <!-- <el-select v-model="form.peer_ip" filterable placeholder="Select">
      <el-option v-for="vpn of vpns" :key="vpn" :label="vpn" :value="vpn">
      </el-option>
    </el-select> -->

    <el-button type="primary" @click="loadData">Load data</el-button>
  </el-form>
</template>

<script lang="ts">
import {defineComponent} from 'vue';

export default defineComponent({
  name: 'FilterRouteMonitor',
  prop: {
    testpro: String,
  },
});
</script>
