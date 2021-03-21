<template>
  <div class="graph">
    <Fullscreen>
      <Cytoscape />
    </Fullscreen>
    <Sidebar>
      <Filter v-on:load-data="loadState" />
    </Sidebar>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import axios from 'axios';
import Graphology from 'graphology';
import {StatePkt} from '../types';

import Sidebar from '@/views/Sidebar.vue';
import Fullscreen from '@/views/Fullscreen.vue';

import Filter from '@/components/Filter.vue';
import Cytoscape from '@/components/Cytoscape.vue';

export default defineComponent({
  name: 'Graph',
  components: {
    Sidebar,
    Fullscreen,
    Filter,
    Cytoscape,
  },
  data: () => ({
    graphology: Graphology.prototype,
  }),
  methods: {
    loadState: async function (info: {vpn: string; timestamp: number}) {
      console.log('Graph loading state!', info);
      const {vpn, timestamp} = info;
      const response = await axios.get(
        'http://10.212.226.67:3000/api/bmp/state',
        {
          params: {
            vpn,
            timestamp,
          },
        }
      );
      const statePkt: StatePkt = response.data;

      for (const key in statePkt.state) {
        const vr = statePkt.state[key].virtualRouter;
        console.log(vr);
      }
    },
  },
  mounted() {
    this.graphology = new Graphology();
  },
});
</script>
