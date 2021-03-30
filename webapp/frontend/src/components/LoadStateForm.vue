<template>
  <div>
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
            @blur="timestampChanged"
          />
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24" class="text-center">
          <el-select
            v-model="form.vpn"
            filterable
            :loading="isLoading"
            placeholder="Select"
            class="side-elem-width"
            @change="loadState"
          >
            <el-option v-for="vpn of vpns" :key="vpn" :label="vpn" :value="vpn">
            </el-option>
          </el-select>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import axios, {CancelToken, CancelTokenSource} from 'axios';
import _ from 'lodash';

function getRelativeTime(seconds: number) {
  const date = new Date();
  date.setTime(date.getTime() - 1000 * seconds);
  return date;
}

function dateToSeconds(date: Date) {
  return Math.floor(date.getTime() / 1000);
}

function getVpns(timestamp: Date, axiosToken: CancelToken) {
  return axios.get('http://10.212.226.67:3000/api/vpn/distinct', {
    params: {timestamp: dateToSeconds(timestamp)},
    cancelToken: axiosToken,
  });
}

export default defineComponent({
  name: 'LoadStateForm',
  props: {
    loading: Boolean,
    modelValue: Object,
  },
  emits: ['update:modelValue'],
  data() {
    return {
      isLoading: false,
      form: {
        vpn:
          this.$props.modelValue && this.$props.modelValue.vpn
            ? this.$props.modelValue.vpn
            : '',
        datetime:
          this.$props.modelValue && this.$props.modelValue.datetime
            ? this.$props.modelValue.datetime
            : new Date(),
      },
      axiosToken: undefined as undefined | CancelTokenSource,
      cachedDatetime: undefined as undefined | Date,
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
  watch: {
    modelValue() {
      this.loadState();
      this.form = _.clone(this.modelValue) as {vpn: string; datetime: Date};
    },
  },
  methods: {
    loadState() {
      if (
        this.form.vpn === '' ||
        (this.modelValue &&
          this.form.vpn === this.modelValue.vpn &&
          this.form.datetime === this.modelValue.datetime)
      ) {
        return;
      }

      // We need to change object
      // or the change event will not be emitted correctly
      const form = _.clone(this.form);

      this.$emit('update:modelValue', form);
    },
    timestampChanged() {
      // component plus is not in ms precision
      if (
        this.form.datetime === null ||
        (this.cachedDatetime &&
          dateToSeconds(this.form.datetime) ===
            dateToSeconds(this.cachedDatetime))
      )
        return;
      this.cachedDatetime = this.form.datetime;

      if (this.axiosToken !== undefined) {
        this.axiosToken.cancel();
      }

      this.isLoading = true;
      this.axiosToken = axios.CancelToken.source();
      const selected = this.form.datetime;
      this.vpns = [];
      const selectedVpn = this.form.vpn;
      this.form.vpn = '';

      getVpns(selected, this.axiosToken.token)
        .then(response => {
          const vpns = response.data;
          vpns.sort();
          this.vpns = vpns;
          if (vpns.indexOf(selectedVpn) !== -1) {
            this.form.vpn = selectedVpn;
            this.loadState();
          }
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
  },
  mounted: function () {
    this.timestampChanged();
  },
});
</script>

<style scoped>
h1 {
  margin-top: 10px;
  margin-bottom: 10px;
  text-align: center;
}
</style>
