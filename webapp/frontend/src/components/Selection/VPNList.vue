<template>
  <el-row>
    <el-col :span="24" class="text-center">
      <el-select
        v-model="selectedVPN"
        filterable
        clearable
        allow-create
        size="medium"
        placeholder="Select VPN"
        class="form-medium"
        :loading="isloading"
      >
        <el-option v-for="vpn of VPNList" :key="vpn" :label="vpn" :value="vpn">
        </el-option>
      </el-select>
    </el-col>
  </el-row>
</template>

<script lang="ts">
import {defineComponent} from 'vue';

export default defineComponent({
  name: 'Timestamp',
  data() {
    return {
      VPNList: [] as string[],
      isloading: false,
    };
  },
  computed: {
    selectedVPN: {
      get() {
        return this.$store.state.selectedVPN;
      },
      set(selection: string | undefined) {
        this.$store.commit('selectedVPN', selection);
      },
    },
    selectedTimestamp() {
      return this.$store.state.selectedTimestamp;
    },
  },
  watch: {
    selectedTimestamp() {
      this.loadVPNList();
    },
  },
  methods: {
    async loadVPNList() {
      this.isloading = true;
      const timestamp = this.selectedTimestamp;
      if (timestamp === undefined) return;
      try {
        const result = await this.$http.get('/api/vpn/list', {
          params: {timestamp},
          headers: {
            REQUEST_ID: 'vpn_list',
            THROTTLE: '1000',
            CANCEL: 'true',
          },
        });
        const VPNList = result.data as string[];
        VPNList.sort();
        this.VPNList = VPNList;
        this.isloading = false;
      } catch (e) {
        if (e.__CANCEL__) {
          console.log('Request cancelled');
        } else if (e.name === 'REQABORTTHROTTLE') {
          console.log('request aborted due to throttle policy');
        } else {
          console.error(e.stack, e);
        }
      }
    },
  },
  mounted() {
    this.loadVPNList();
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
