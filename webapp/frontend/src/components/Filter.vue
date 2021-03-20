<template>
  <div class="filter">
    <input v-model="vpn" placeholder="edit me" />
    <button v-on:click="loadData">Load data</button>
    <br>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Filter',
  props: {
    msg: String,
  },
  data() {
    return {
      vpn: ''
    }
  },
  methods: {
    loadData: function(){
      console.log('Filter: loading data!', this.$data.vpn)
      this.$emit('loadData', {
        timestamp: 1615404068,
        vpn: '64497:1'
      })
    }
  }
});
</script>
