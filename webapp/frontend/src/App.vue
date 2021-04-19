<template>
  <main-view></main-view>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import MainView from '@/views/Main.vue';

export default defineComponent({
  components: {
    MainView,
  },
});
</script>

<style>
.text-center {
  text-align: center;
}

.ml-10 {
  margin-left: 10px;
}
</style>
