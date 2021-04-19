<template>Hello World Peering Topology</template>

<script lang="ts">
import {defineComponent} from 'vue';

export default defineComponent({
  name: 'PeeringTopology',
  components: {},
  mounted() {
    this.$store.commit('selectedVisualization', 'peering-topology');
  },
});
</script>

<style>
.form-medium {
  width: 95% !important;
}
</style>
