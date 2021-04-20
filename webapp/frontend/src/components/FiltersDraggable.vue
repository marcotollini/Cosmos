<template>
  <draggable tag="div" v-model="fields" item-key="id">
    <template #item="{element}">
      <el-tag>{{ element.id }}</el-tag>
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
      fields: [
        {
          id: 'bmpRouter',
        },
        {
          id: 'ipPrefix',
        },
        {id: 'comms'},
      ],
    };
  },
});
</script>

<style>
.el-collapse-item__header {
  padding-left: 10px;
  height: 30px !important;
}
</style>
