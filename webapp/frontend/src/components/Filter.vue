<template>
  <div class="filter">
    {{ msg }}
    <button v-on:click="loadData">Async</button>
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
  methods: {
    loadData: function(){
      console.log('loading data!')
    }
  }
});
</script>
