<template>
  <div class="filter">
    <select v-model="vpnSelected">
      <option v-for="vpn of vpns" v-bind:key="vpn">{{ vpn }}</option>
    </select>
    <br />
    <input
      type="datetime-local"
      id="meeting-time"
      name="meeting-time"
      value="2018-06-12T19:30"
      min="2018-06-07T00:00"
      max="2018-06-14T00:00"
    />
    <!-- <button v-on:click="loadData">Load data</button> -->
    <el-button>Load data</el-button>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import axios from 'axios';
import {ElButton} from 'element-plus';

export default defineComponent({
  name: 'Filter',
  data() {
    return {
      currentDate: new Date().toString(),
      vpns: [],
      vpnSelected: undefined,
    };
  },
  watch: {
    vpnSelected: function () {
      console.log(this.vpnSelected);
    },
  },
  methods: {
    loadData: function () {
      console.log(this.vpns);
      this.$emit('loadData', {
        timestamp: 1615404068,
        vpn: '64497:1',
      });
    },
  },
  mounted: function () {
    axios
      .get('http://10.212.226.67:3000/api/vpn/distinct')
      .then(response => (this.vpns = response.data));
  },
});
</script>
