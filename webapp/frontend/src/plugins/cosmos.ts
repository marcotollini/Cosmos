import {App} from 'vue';
import {ComponentCustomProperties} from 'vue';

// TODO: move to cosmos-lib
// import {visualizationType} from 'cosmos-lib';
type visualizationType =
  | 'VPNTopology'
  | 'VPNRoutingTopology'
  | 'PeeringTopology';

function changeRouteVisualization(this: ComponentCustomProperties) {
  if (this.$store === undefined)
    return console.log('Store not defined. .use(Cosmos) should be after state');
  this.$store.watch(
    (state: any) => state.selectedVisualization,
    (newValue: visualizationType, oldValue: visualizationType) => {
      this.$router.push({name: newValue});
    }
  );
}

export default {
  install: (app: App) => {
    app.config.globalProperties.$changeRouteVisualization = changeRouteVisualization;
    app.config.globalProperties.$changeRouteVisualization();
  },
};
