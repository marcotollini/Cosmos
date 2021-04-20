<template>
  <draggable
    tag="div"
    class="a"
    v-model="fields"
    :group="{name: 'people', pull: 'clone', put: false}"
  >
    <template #item="{element}">
      <el-tag type="info" effect="dark">{{ element }}</el-tag>
    </template>
  </draggable>

  <draggable tag="div" v-model="fields2" group="people">
    <template #item="{element}">
      <el-tag effect="dark" closable>{{ element }}</el-tag>
    </template>
  </draggable>

  <!-- <el-popover placement="bottom" :width="200" trigger="click">
    <template #reference>
      <el-button round size="mini">Round</el-button>
    </template>
    <el-select
      clearable
      filterable
      allow-create
      multiple
      size="mini"
      placeholder="Select"
    >
      <el-option label="val1" value="val1"></el-option>
      <el-option label="val2" value="val2"></el-option>
      <el-option label="val3" value="val3"></el-option>
    </el-select>
  </el-popover> -->
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import draggable from 'vuedraggable';

export default defineComponent({
  name: 'FiltersDraggable',
  components: {
    draggable,
  },
  data() {
    return {
      fields: ['bmpRouter', 'ipPrefix', 'comms'],
      fields2: [],
    };
  },
});
</script>

<style scoped>
.el-tag {
  margin: 5px;
}
.a {
  width: 100%;
}
</style>
