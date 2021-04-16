import {createApp} from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import ElementPlus from 'element-plus';
import VueApexCharts from 'vue3-apexcharts';
import Cosmos from '@/plugins/cosmos';
import Axios from '@/plugins/axios';

import 'element-plus/lib/theme-chalk/index.css';

createApp(App)
  .use(store)
  .use(router)
  .use(ElementPlus)
  .use(VueApexCharts)
  .use(Axios)
  .use(Cosmos)
  .mount('#app');
