import {createApp} from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import ElementPlus from 'element-plus';
import VueApexCharts from 'vue3-apexcharts';
import {default as SocketIO, SocketClientOptions} from '@/plugins/Socket.io';

import 'element-plus/lib/theme-chalk/index.css';

const socketOpts: SocketClientOptions = {
  connection: 'http://10.212.226.67:3000',
  options: {
    path: '/socket/',
  },
  store: {
    mutation: 'SOCKET_',
    action: 'SOCKET_',
    syncronize: {
      elements: ['selectedTimestamp', 'selectedVPN'],
      prefix: 'SYNC_',
    },
  },
};

createApp(App)
  .use(store)
  .use(router)
  .use(ElementPlus)
  .use(VueApexCharts)
  .use(SocketIO, socketOpts)
  .mount('#app');
