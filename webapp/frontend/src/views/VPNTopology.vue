<template>
  <side-bottom-four-slots>
    <template v-slot:side-top>
      <timestamp></timestamp>
      <VPN-list></VPN-list>
      <visualization></visualization>
    </template>
    <template v-slot:side-bottom>Side bottom</template>
    <template v-slot:main>main</template>
    <template v-slot:footer>footer</template>>
  </side-bottom-four-slots>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import SideBottomFourSlots from '@/views/Structure/SideBottomFourSlots.vue';
import Timestamp from '@/components/Selection/Timestamp.vue';
import VPNList from '@/components/Selection/VPNList.vue';
import Visualization from '@/components/Selection/Visualization.vue';

export default defineComponent({
  name: 'Home',
  components: {
    SideBottomFourSlots,
    Timestamp,
    VPNList,
    Visualization,
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
