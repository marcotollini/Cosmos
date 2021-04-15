import {createRouter, createWebHistory, RouteRecordRaw} from 'vue-router';
import VPNTopology from '@/views/VPNTopology.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'default',
    component: VPNTopology,
  },
  {
    path: '/vpn-topology',
    name: 'vpn-topology',
    component: VPNTopology,
  },

  // {
  //   path: '/about',
  //   name: 'About',
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () =>
  //     import(/* webpackChunkName: "about" */ '../views/About.vue'),
  // },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
