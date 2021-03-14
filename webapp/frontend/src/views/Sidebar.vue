<template>
  <div class="sidebar">
    <h1>Cosmos</h1>
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Sidebar'
});
</script>

<style scoped>
.sidebar {
  position: absolute;
  left: 2%;
  top: 2%;
  right: 75%;
  bottom: 2%;
  border: 1px solid black;
}
h1 {
  text-align: center;
}
</style>