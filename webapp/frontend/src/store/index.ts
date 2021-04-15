import {createStore} from 'vuex';

export default createStore({
  state: {
    selectedTimestamp: new Date() as Date | undefined,
    selectedVPN: undefined as string | undefined,
    VPNList: [] as string[],
    filterFields: [] as string[],
  },
  mutations: {
    selectedTimestamp(state, timestamp: Date | undefined) {
      console.log(timestamp);
      state.selectedTimestamp = timestamp;
    },
    selectedVPN(state, VPN: string) {
      state.selectedVPN = VPN;
    },
    VPNList(state, VPNs: string[]) {
      state.VPNList = VPNs;
    },
    filterFields(state, fields: string[]) {
      state.filterFields = fields;
    },
  },
  actions: {},
  modules: {},
});
