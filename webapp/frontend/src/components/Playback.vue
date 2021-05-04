<template>
  <el-row>
    <el-col class="text-center">
      <el-button
        type="primary"
        :icon="!running ? 'el-icon-video-play' : 'el-icon-video-pause'"
        @click="playpause"
        circle
      ></el-button>
    </el-col>
  </el-row>
  <el-row class="mt-15 mb-20 pl-5 pr-5">
    <el-col :span="12" class="pr-5">
      <el-input
        placeholder="Speed"
        prefix-icon="el-icon-time"
        v-model="speed"
        type="number"
      >
      </el-input>
    </el-col>
    <el-col :span="12" class="pl-5">
      <el-input
        placeholder="Resolution"
        prefix-icon="el-icon-picture-outline"
        v-model="resolution"
        type="number"
      >
      </el-input>
    </el-col>
    <span v-if="running && loadingTime !== ''" class="mt-5"
      >Loaded {{ timestampLoadedView.toLocaleString() }} in
      {{ loadingTime }}s</span
    >
  </el-row>
</template>

<script lang="ts">
import {defineComponent} from 'vue';

export default defineComponent({
  name: 'Timestamp',
  data() {
    return {
      speed: '' as number | '',
      resolution: '' as number | '',
      ready: {
        timestamp: false,
        wait: false,
      },
      timer: undefined as any,
      startLoading: new Date(),
      loadingTime: '',
    };
  },
  computed: {
    selectedTimestamp(): Date {
      return this.$store.state.selectedTimestamp;
    },
    running() {
      return this.$store.state.playbackMode;
    },
    timestampLoadedView(): Date {
      return this.$store.state.timestampLoadedView;
    },
  },
  watch: {
    speed() {
      if (this.speed === '') return;
      if (this.speed < 1) {
        this.$store.commit('playbackModeDisable');
        this.speed = '';
        this.$notify({
          title: 'Speed out of range',
          message: 'Speed should be >= 1',
          type: 'error',
        });
      }
    },
    resolution() {
      if (this.resolution === '') return;

      if (this.resolution <= 0) {
        this.$store.commit('playbackModeDisable');
        this.resolution = '';
        this.$notify({
          title: 'Resolution out of range',
          message: 'Resolution should be > 0',
          type: 'error',
        });
      } else if (this.resolution > 600) {
        this.resolution = 600;
        this.$notify({
          title: 'Resolution out of range',
          message: 'Resolution should be < 600',
          type: 'error',
        });
      }
    },
    timestampLoadedView() {
      if (!this.running) return;
      this.ready.timestamp = true;
      const end = new Date();
      this.loadingTime = (
        (end.getTime() - this.startLoading.getTime()) /
        1000
      ).toString();
    },
    ready: {
      handler() {
        if (this.ready.timestamp && this.ready.wait) this.tick();
      },
      deep: true,
    },
  },
  methods: {
    playpause() {
      if (this.speed === '' || this.resolution === '') {
        this.$notify({
          title: 'Value required',
          message: 'Speed and resolution are required',
          type: 'error',
        });
        this.$store.commit('playbackModeDisable');
        return;
      }
      this.$store.commit('playbackModeToggle');

      if (this.running) this.changeRunning();
      else this.changeNotRunning();
    },
    changeRunning() {
      this.$store.commit('showLoading', false);
      this.ready.timestamp = true;
      this.ready.wait = true;
    },
    changeNotRunning() {
      this.$store.commit('showLoading', true);
      this.ready.timestamp = false;
      this.ready.wait = false;
      if (this.timer !== undefined) {
        clearInterval(this.timer);
      }
      this.loadingTime = '';
    },
    tick() {
      this.ready.timestamp = false;
      this.ready.wait = false;

      if (this.speed === '' || this.resolution === '') return;
      this.startLoading = new Date();

      const date = new Date(
        this.selectedTimestamp.getTime() + this.resolution * 1000
      );
      this.$store.commit('selectedTimestamp', date);

      this.timer = setTimeout(() => {
        this.ready.wait = true;
      }, this.speed * 1000);
    },
  },
});
</script>
