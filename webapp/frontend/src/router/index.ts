import {createRouter, createWebHistory, RouteRecordRaw} from 'vue-router';
import MainVisualization from '@/views/MainVisualization.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/q/:catchAll(.*)',
    name: 'query',
    component: MainVisualization,
  },
  {
    path: '/', // logo click working
    name: 'default',
    component: MainVisualization,
  },
  // {
  //   path: '/vpn-routing-topology',
  //   name: 'vpn-routing-topology',
  //   component: () =>
  //     import(
  //       /* webpackChunkName: "VPNRoutingTopology" */ '../components/Visualization/VPNRoutingTopology.vue'
  //     ),
  // },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
