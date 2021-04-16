import {App} from 'vue';
import {ComponentCustomProperties} from 'vue';

// TODO: move to cosmos-lib
// import {visualizationType} from 'cosmos-lib';
type visualizationType =
  | 'VPNTopology'
  | 'VPNRoutingTopology'
  | 'PeeringTopology';

function changeRouteVisualization(this: ComponentCustomProperties) {
  this.$store.watch(
    (state: any) => state.selectedVisualization,
    (newValue: visualizationType, oldValue: visualizationType) => {
      this.$router.push({name: newValue});
    }
  );
}

function watchers(this: ComponentCustomProperties) {
  if (this.$store === undefined)
    return console.log('Store not defined. .use(Cosmos) should be after state');

  changeRouteVisualization.bind(this)();
}

function initialization(this: ComponentCustomProperties) {
  if (this.$store === undefined)
    return console.log('Store not defined. .use(Cosmos) should be after state');
}

export default {
  install: (app: App) => {
    app.config.globalProperties.$watchers = watchers;
    app.config.globalProperties.$watchers();
    app.config.globalProperties.$initialization = initialization;
    app.config.globalProperties.$initialization();
  },
};
