<template>
  <div class="fullscreen">
    <slot></slot>
  </div>
</template>

<script lang="ts">

</script>

<style scoped>
.fullscreen {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  border: 1px solid red;
}
</style>