<template>
  <h1>Cosmos</h1>
  <el-form ref="form" :model="form" label-width="120px">
    <el-select v-model="form.vpn" filterable placeholder="Select">
      <el-option v-for="vpn of vpns" :key="vpn" :label="vpn" :value="vpn">
      </el-option>
    </el-select>
    <br />
    <el-date-picker
      v-model="form.datetime"
      type="datetime"
      placeholder="Select date and time"
      :shortcuts="timeShortcuts"
    >
    </el-date-picker>

    <el-button type="primary" @click="loadData">Load data</el-button>
  </el-form>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import axios from 'axios';

function getRelativeTime(seconds: number) {
  const date = new Date();
  date.setTime(date.getTime() - 1000 * seconds);
  return date;
}

export default defineComponent({
  name: 'Filter',
  prop: {
    loading: false,
  },
  data() {
    return {
      form: {
        vpn: '',
        datetime: new Date(),
      },
      vpns: [],
      timeShortcuts: [
        {
          text: 'Now',
          value: new Date(),
        },
        {
          text: '1 Minute',
          value: getRelativeTime(60),
        },
        {
          text: '5 Minutes',
          value: getRelativeTime(60 * 5),
        },
        {
          text: '15 Minutes',
          value: getRelativeTime(60 * 15),
        },
        {
          text: '1 Hour',
          value: getRelativeTime(60 * 60),
        },
        {
          text: '2 Hours',
          value: getRelativeTime(60 * 60 * 2),
        },
        {
          text: '6 Hours',
          value: getRelativeTime(60 * 60 * 6),
        },
        {
          text: '12 Hours',
          value: getRelativeTime(60 * 60 * 12),
        },
        {
          text: 'Yesterday',
          value: getRelativeTime(60 * 60 * 24),
        },
      ],
    };
  },
  methods: {
    loadData() {
      if (this.form.vpn === '') {
        return;
      }

      const vpn = this.form.vpn;
      const epoch = Math.floor(new Date(this.form.datetime).getTime() / 1000);

      this.$emit('loadData', {
        timestamp: epoch,
        vpn,
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
