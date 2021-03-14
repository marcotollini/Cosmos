<template>
  <div class="filter">
    {{ msg }} - {{ computedMsg }}
    <button v-on:click="changeState">Add 1</button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Filter',
  props: {
    msg: String,
  },
  computed: {
    computedMsg(){
      return this.$store.state.graph
    }
  },
  methods: {
    changeState() {
      this.$store.commit('changeState')
    }
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
