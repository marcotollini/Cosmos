<template>
  <el-row>
    <el-col class="text-center">
      <el-button
        type="primary"
        :icon="running ? 'el-icon-video-play' : 'el-icon-video-pause'"
        @click="playpause"
        circle
      ></el-button>
    </el-col>
  </el-row>
  <el-row class="mt-15 mb-20 pl-5 pr-5">
    <el-col :span="12" class="pr-5">
      <el-input
        placeholder="Speed"
        prefix-icon="el-icon-d-arrow-right"
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
  </el-row>
</template>

<script lang="ts">
import {defineComponent} from 'vue';

export default defineComponent({
  name: 'Timestamp',
  data() {
    return {
      running: true as boolean,
      speed: undefined as number | undefined | '',
      resolution: undefined as number | undefined | '',
    };
  },
  watch: {
    speed() {
      if (this.speed === '') this.speed = undefined;
      if (this.speed === undefined) return;
      if (this.speed <= 0) {
        this.running = false;
        this.speed = undefined;
        this.$notify({
          title: 'Speed out of range',
          message: 'Speed should be > 0',
          type: 'error',
        });
      } else if (this.speed > 2) {
        this.speed = 2;
        this.$notify({
          title: 'Out of range',
          message: 'Resolution should be < 2',
          type: 'error',
        });
      }
    },
    resolution() {
      if (this.resolution === '') this.resolution = undefined;
      if (this.resolution === undefined) return;

      if (this.resolution <= 0) {
        this.running = false;
        this.resolution = undefined;
        this.$notify({
          title: 'Resolution o ut of range',
          message: 'Resolution should be > 0',
          type: 'error',
        });
      } else if (this.resolution > 600) {
        this.resolution = 600;
        this.$notify({
          title: 'Out of range',
          message: 'Resolution should be < 600',
          type: 'error',
        });
      }
    },
  },
  methods: {
    playpause() {
      if (
        this.speed === undefined ||
        this.speed <= 0 ||
        this.resolution === undefined ||
        this.resolution <= 0
      ) {
        this.running = false;
      }
      this.running = !this.running;
    },
  },
});
</script>
