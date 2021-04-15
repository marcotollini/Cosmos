<template>
  <el-row>
    <el-col :span="24" class="text-center">
      <el-date-picker
        v-model="selectedTimestamp"
        type="datetime"
        placeholder="Select date and time"
        :shortcuts="timeShortcuts"
        class="form-medium"
      />
    </el-col>
  </el-row>
</template>

<script lang="ts">
import {defineComponent} from 'vue';

function getRelativeTime(seconds: number) {
  const date = new Date();
  date.setTime(date.getTime() - 1000 * seconds);
  return date;
}

export default defineComponent({
  name: 'Timestamp',
  data() {
    return {
      timeShortcuts: [
        {
          text: 'Now',
          onClick: () => {
            this.updateTimestamp(new Date());
          },
        },
        {
          text: '1 Minute',
          onClick: () => {
            this.updateTimestamp(getRelativeTime(60));
          },
        },
        {
          text: '5 Minutes',
          onClick: () => {
            this.updateTimestamp(getRelativeTime(60 * 5));
          },
        },
        {
          text: '15 Minutes',
          onClick: () => {
            this.updateTimestamp(getRelativeTime(60 * 15));
          },
        },
        {
          text: '1 Hour',
          onClick: () => {
            this.updateTimestamp(getRelativeTime(60 * 60));
          },
        },
        {
          text: '2 Hours',
          onClick: () => {
            this.updateTimestamp(getRelativeTime(60 * 60 * 2));
          },
        },
        {
          text: '6 Hours',
          onClick: () => {
            this.updateTimestamp(getRelativeTime(60 * 60 * 6));
          },
        },
        {
          text: '12 Hours',
          onClick: () => {
            this.updateTimestamp(getRelativeTime(60 * 60 * 12));
          },
        },
        {
          text: 'Yesterday',
          onClick: () => {
            this.updateTimestamp(getRelativeTime(60 * 60 * 24));
          },
        },
      ],
    };
  },
  computed: {
    selectedTimestamp: {
      get() {
        return this.$store.state.selectedTimestamp;
      },
      set(timestamp: Date) {
        this.updateTimestamp(timestamp);
      },
    },
  },
  methods: {
    updateTimestamp(timestamp: Date) {
      this.$store.commit('selectedTimestamp', timestamp);
    },
  },
});
</script>

<style scoped>
h1 {
  margin: 0;
  padding: 20px 0;
  text-align: center;
  font-size: 1.3em;
}

a {
  text-decoration: none;
  color: inherit;
}
</style>
