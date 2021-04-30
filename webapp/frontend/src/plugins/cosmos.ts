import {App} from 'vue';
import {ComponentCustomProperties} from 'vue';

function watchers(this: ComponentCustomProperties) {
  if (this.$store === undefined)
    return console.log('Store not defined. .use(Cosmos) should be after state');
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
