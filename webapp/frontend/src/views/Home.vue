<template>
  <Graph />
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import Graph from '@/components/Graph.vue';

export default defineComponent({
  name: 'Home',
  components: {
    Graph,
  },
});
</script>
