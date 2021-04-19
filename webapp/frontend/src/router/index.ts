import {createRouter, createWebHistory, RouteRecordRaw} from 'vue-router';
import VPNTopology from '@/components/Visualization/VPNTopology.vue';

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
  {
    path: '/vpn-routing-topology',
    name: 'vpn-routing-topology',
    component: () =>
      import(
        /* webpackChunkName: "VPNRoutingTopology" */ '../components/Visualization/VPNRoutingTopology.vue'
      ),
  },
  {
    path: '/peering-topology',
    name: 'peering-topology',
    component: () =>
      import(
        /* webpackChunkName: "VPNRoutingTopology" */ '../components/Visualization/PeeringTopology.vue'
      ),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
