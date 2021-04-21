<template>
  <side-bottom-three-slots>
    <template v-slot:side-top>
      <el-row>
        <el-col :span="24" class="text-center">
          <timestamp></timestamp>
        </el-col>
        <el-col :span="24" class="text-center">
          <VPN-list></VPN-list>
        </el-col>
        <el-col :span="24" class="text-center">
          <visualization></visualization>
        </el-col>
      </el-row>
      <el-divider>Active Filters</el-divider>
      <el-row>
        <el-col :span="24" class="text-center">
          Place your filters here
          <filters-active></filters-active>
        </el-col>
      </el-row>
      <el-row>
        <el-divider>All Filters</el-divider>
        <el-col :span="24" class="text-center">
          <filters-draggable></filters-draggable>
        </el-col>
      </el-row>
    </template>
    <template v-slot:main>
      <router-view></router-view>
    </template>
    <template v-slot:footer>footer</template>
  </side-bottom-three-slots>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import SideBottomThreeSlots from '@/views/Structure/SideBottomThreeSlots.vue';
import Timestamp from '@/components/Selection/Timestamp.vue';
import VPNList from '@/components/Selection/VPNList.vue';
import Visualization from '@/components/Selection/Visualization.vue';
import FiltersDraggable from '@/components/FiltersDraggable.vue';
import FiltersActive from '@/components/FiltersActive.vue';

export default defineComponent({
  name: 'Main',
  components: {
    SideBottomThreeSlots,
    Timestamp,
    VPNList,
    Visualization,
    FiltersDraggable,
    FiltersActive,
  },
});
</script>

<style>
.form-medium {
  width: 95% !important;
}

.el-divider__text {
  background-color: #fafafa !important;
}
</style>
