import {createStore} from 'vuex';

// TODO: move to cosmos-lib
// import {visualizationType} from 'cosmos-lib';
type visualizationType =
  | 'VPNTopology'
  | 'VPNRoutingTopology'
  | 'PeeringTopology';

export default createStore({
  state: {
    selectedTimestamp: new Date() as Date | undefined,
    selectedVPN: undefined as string | undefined,
    selectedVisualization: undefined as visualizationType | undefined,
    activeFilters: {} as Record<string, unknown[]>,
  },
  mutations: {
    selectedTimestamp(state, timestamp: Date | undefined) {
      state.selectedTimestamp = timestamp;
    },
    selectedVPN(state, vpn: string | undefined) {
      state.selectedVPN = vpn;
    },
    selectedVisualization(state, visualization: visualizationType | undefined) {
      state.selectedVisualization = visualization;
    },
    activeFilters(state, filters: Record<string, unknown[]>) {
      state.activeFilters = filters;
    },
  },
  actions: {},
});
