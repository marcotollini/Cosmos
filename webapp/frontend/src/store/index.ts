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
    selectedVisualization: undefined as visualizationType | undefined,
  },
  mutations: {
    selectedTimestamp(state, timestamp: Date | undefined) {
      state.selectedTimestamp = timestamp;
    },
    selectedVisualization(state, visualization: visualizationType | undefined) {
      state.selectedVisualization = visualization;
    },
  },
  actions: {},
});
