<template>Hello World VPNRoutingTopology</template>

<script lang="ts">
import {defineComponent} from 'vue';

export default defineComponent({
  name: 'VPNRoutingTopology',
  components: {},
  mounted() {
    this.$store.commit('selectedVisualization', 'vpn-routing-topology');
  },
});
</script>

<style>
.form-medium {
  width: 95% !important;
}
</style>
