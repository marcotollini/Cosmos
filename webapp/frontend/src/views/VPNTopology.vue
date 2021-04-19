<template>
  <side-bottom-three-slots>
    <template v-slot:side-top>
      <timestamp></timestamp>
      <VPN-list></VPN-list>
      <visualization></visualization>
      <filters-BMP-state></filters-BMP-state>
    </template>
    <template v-slot:main>main</template>
    <template v-slot:footer>footer</template>
  </side-bottom-three-slots>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import SideBottomThreeSlots from '@/views/Structure/SideBottomThreeSlots.vue';
import Timestamp from '@/components/Selection/Timestamp.vue';
import VPNList from '@/components/Selection/VPNList.vue';
import Visualization from '@/components/Selection/Visualization.vue';
import FiltersBMPState from '@/components/FiltersBMPState.vue';

export default defineComponent({
  name: 'VPNTopology',
  components: {
    SideBottomThreeSlots,
    Timestamp,
    VPNList,
    Visualization,
    FiltersBMPState,
  },
  mounted() {
    this.$store.commit('selectedVisualization', 'vpn-topology');
  },
});
</script>

<style>
.form-medium {
  width: 95% !important;
}
</style>
