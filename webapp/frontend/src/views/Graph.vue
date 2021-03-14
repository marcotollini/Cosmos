<template>
  <div class="graph">
    <Fullscreen>
      <Cytoscape :graph="graph" />
    </Fullscreen>
    <Sidebar>
      <Filter msg="Change state" />
    </Sidebar>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
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
    Cytoscape
  },
  computed:{
    graph(){
      return this.$store.state.graph;
    }
  }
});
</script>