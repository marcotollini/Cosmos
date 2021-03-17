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
