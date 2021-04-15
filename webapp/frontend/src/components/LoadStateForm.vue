<template>
  <div>
    <h1>Cosmos</h1>
    <el-form ref="form">
      <el-row>
        <el-col :span="24" class="text-center">
          <el-date-picker
            v-model="selectedTimestamp"
            type="datetime"
            placeholder="Select date and time"
            :shortcuts="timeShortcuts"
            class="side-elem-width"
            @blur="commitSelectedTimestmap"
          />
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24" class="text-center">
          <!-- <el-select
            v-model="form.vpn"
            filterable
            :loading="isLoadingVpnList"
            placeholder="Select"
            class="side-elem-width"
            @change="loadState"
          >
            <el-option
              v-for="vpn of vpnList"
              :key="vpn"
              :label="vpn"
              :value="vpn"
            >
            </el-option>
          </el-select> -->
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {mapMutations} from 'vuex';

function getRelativeTime(seconds: number) {
  const date = new Date();
  date.setTime(date.getTime() - 1000 * seconds);
  return date;
}

export default defineComponent({
  name: 'LoadStateForm',
  props: {},
  data() {
    return {
      timeShortcuts: [
        {
          text: 'Now',
          onClick: () => {
            this.selectedTimestamp = new Date();
          },
        },
        {
          text: '1 Minute',
          onClick: () => {
            this.selectedTimestamp = getRelativeTime(60);
          },
        },
        {
          text: '5 Minutes',
          onClick: () => {
            this.selectedTimestamp = getRelativeTime(60 * 5);
          },
        },
        {
          text: '15 Minutes',
          onClick: () => {
            this.selectedTimestamp = getRelativeTime(60 * 15);
          },
        },
        {
          text: '1 Hour',
          onClick: () => {
            this.selectedTimestamp = getRelativeTime(60 * 60);
          },
        },
        {
          text: '2 Hours',
          onClick: () => {
            this.selectedTimestamp = getRelativeTime(60 * 60 * 2);
          },
        },
        {
          text: '6 Hours',
          onClick: () => {
            this.selectedTimestamp = getRelativeTime(60 * 60 * 6);
          },
        },
        {
          text: '12 Hours',
          onClick: () => {
            this.selectedTimestamp = getRelativeTime(60 * 60 * 12);
          },
        },
        {
          text: 'Yesterday',
          onClick: () => {
            this.selectedTimestamp = getRelativeTime(60 * 60 * 24);
          },
        },
      ],
      suggestedTimestamp: new Date(),
      selectedTimestamp: undefined as Date | undefined,
    };
  },
  computed: {
    // selectedTimestampBkp: {
    //   get() {
    //     return this.$store.state.selectedTimestamp;
    //   },
    //   set(value) {
    //     this.$store.commit('selectedTimestamp', value);
    //   },
    // },
  },
  methods: {
    commitSelectedTimestmap() {
      this.$store.commit('selectedTimestamp', this.selectedTimestamp);
    },
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
