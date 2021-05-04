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
    // used to save the custom values of the components
    // to be saved in the query
    customVisualizationQuery: {} as Record<string, unknown[]>,
    playbackMode: false as boolean,
    showLoading: true as boolean,
    timestampLoadedView: undefined as Date | undefined,
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
    customVisualizationQueryDefault(state) {
      state.customVisualizationQuery = {};
    },
    customVisualizationQuery(state, data: Record<string, unknown[]>) {
      state.customVisualizationQuery = data;
    },
    playbackMode(state, isPlayack: boolean) {
      state.playbackMode = isPlayack;
    },
    playbackModeEnable(state) {
      state.playbackMode = true;
    },
    playbackModeDisable(state) {
      state.playbackMode = false;
    },
    playbackModeToggle(state) {
      state.playbackMode = !state.playbackMode;
    },
    showLoading(state, showLoading: boolean) {
      state.showLoading = showLoading;
    },
    timestampLoadedView(state, timestamp: Date | undefined) {
      state.timestampLoadedView = timestamp;
    },
  },
  actions: {},
});
