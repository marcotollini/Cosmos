<template>
  <h1 class="title"><a href="/" @click.prevent="homepage">Cosmos</a></h1>
</template>

<script lang="ts">
import {defineComponent} from 'vue';

export default defineComponent({
  name: 'Logo',
  methods: {
    homepage() {
      this.$router.push({name: 'default'});
    },
  },
});
</script>

<style scoped>
h1 {
  margin: 0;
  padding: 20px 0;
  text-align: center;
  font-size: 1.3em;
}

a {
  text-decoration: none;
  color: inherit;
}
</style>
