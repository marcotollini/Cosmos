<template>
  <div class="filter">
    {{ msg }}
    <button v-on:click="changeStateAsync">Async</button>
    <br>
    {{ computedMsg }}
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapMutations, mapActions } from 'vuex'

export default defineComponent({
  name: 'Filter',
  props: {
    msg: String,
  },
  computed: {
    computedMsg(): string{
      return JSON.stringify(this.$store.state.graph)
    }
  },
  methods: {
    ...mapMutations(['changeState']),
    ...mapActions(['changeStateAsync']),
    // changeState() {
    //   this.$store.commit('changeState')
    // }
    // changeStateTimeout() {
    //   this.$store.dispatch('changeStateAsync')
    // }
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
