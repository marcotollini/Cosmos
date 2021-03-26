<template>
  <h1>Cosmos</h1>
  <el-form ref="form" :model="form">
    <el-row>
      <el-col :span="24" class="text-center">
        <el-date-picker
          v-model="form.datetime"
          type="datetime"
          placeholder="Select date and time"
          :shortcuts="timeShortcuts"
          class="side-elem-width"
        />
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24" class="text-center">
        <el-select
          v-model="form.vpn"
          filterable
          placeholder="Select"
          class="side-elem-width"
          @change="loadData"
        >
          <el-option v-for="vpn of vpns" :key="vpn" :label="vpn" :value="vpn">
          </el-option>
        </el-select>
      </el-col>
    </el-row>
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
  name: 'LoadDataForm',
  props: {
    loading: Boolean,
  },
  emits: ['loadData'],
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
          onClick: () => {
            const f = (this.form as unknown) as {vpn: string; datetime: Date};
            f.datetime = new Date();
          },
        },
        {
          text: '1 Minute',
          onClick: () => {
            const f = (this.form as unknown) as {vpn: string; datetime: Date};
            f.datetime = getRelativeTime(60);
          },
        },
        {
          text: '5 Minutes',
          onClick: () => {
            const f = (this.form as unknown) as {vpn: string; datetime: Date};
            f.datetime = getRelativeTime(60 * 5);
          },
        },
        {
          text: '15 Minutes',
          onClick: () => {
            const f = (this.form as unknown) as {vpn: string; datetime: Date};
            f.datetime = getRelativeTime(60 * 15);
          },
        },
        {
          text: '1 Hour',
          onClick: () => {
            const f = (this.form as unknown) as {vpn: string; datetime: Date};
            f.datetime = getRelativeTime(60 * 60);
          },
        },
        {
          text: '2 Hours',
          onClick: () => {
            const f = (this.form as unknown) as {vpn: string; datetime: Date};
            f.datetime = getRelativeTime(60 * 60 * 2);
          },
        },
        {
          text: '6 Hours',
          onClick: () => {
            const f = (this.form as unknown) as {vpn: string; datetime: Date};
            f.datetime = getRelativeTime(60 * 60 * 6);
          },
        },
        {
          text: '12 Hours',
          onClick: () => {
            const f = (this.form as unknown) as {vpn: string; datetime: Date};
            f.datetime = getRelativeTime(60 * 60 * 12);
          },
        },
        {
          text: 'Yesterday',
          onClick: () => {
            const f = (this.form as unknown) as {vpn: string; datetime: Date};
            f.datetime = getRelativeTime(60 * 60 * 24);
          },
        },
      ],
    };
  },
  methods: {
    loadData() {
      if (this.form.vpn === '') {
        return;
      }

      // this.timeShortcuts = [
      //   {
      //     text: 'Now',
      //     value: new Date(),
      //   },
      //   {
      //     text: '1 Minute',
      //     onClick: () => {
      //       console.log('here');
      //     },
      //     // value: getRelativeTime(60),
      //   },
      //   {
      //     text: '5 Minutes',
      //     value: getRelativeTime(60 * 5),
      //   },
      //   {
      //     text: '15 Minutes',
      //     value: getRelativeTime(60 * 15),
      //   },
      //   {
      //     text: '1 Hour',
      //     value: getRelativeTime(60 * 60),
      //   },
      //   {
      //     text: '2 Hours',
      //     value: getRelativeTime(60 * 60 * 2),
      //   },
      //   {
      //     text: '6 Hours',
      //     value: getRelativeTime(60 * 60 * 6),
      //   },
      //   {
      //     text: '12 Hours',
      //     value: getRelativeTime(60 * 60 * 12),
      //   },
      //   {
      //     text: 'Yesterday',
      //     value: getRelativeTime(60 * 60 * 24),
      //   },
      // ];

      console.log('changed');

      const vpn = this.form.vpn;
      const epoch = Math.floor(new Date(this.form.datetime).getTime() / 1000);

      // this.$emit('loadData', {
      //   timestamp: epoch,
      //   vpn,
      // });
    },
  },
  mounted: function () {
    axios.get('http://10.212.226.67:3000/api/vpn/distinct').then(response => {
      this.vpns = response.data;
      this.vpns.sort();
    });
  },
});
</script>
