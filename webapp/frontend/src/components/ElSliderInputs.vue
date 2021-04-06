<template>
  <el-slider
    v-model="model"
    range
    :input-size="inputSize"
    :min="min"
    :max="max"
  ></el-slider>
  Low:
  <el-input-number size="mini" :min="min" :max="high" v-model="low">
  </el-input-number>
  <br />
  High:
  <el-input-number size="mini" :min="low" :max="max" v-model="high">
  </el-input-number>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import _ from 'lodash';

export default defineComponent({
  name: 'ElSliderInputs',
  props: {
    min: Number,
    max: Number,
    inputSize: String,
    modelValue: Array,
  },
  emits: ['loadData', 'update:modelValue', 'change'],
  data() {
    return {
      low: this.$props.min,
      high: this.$props.max,
      model: [this.$props.min, this.$props.max],
    };
  },
  watch: {
    model() {
      this.low = this.model[0];
      this.high = this.model[1];
      this.$emit('update:modelValue', this.model);
      this.$emit('change');
    },
    low() {
      this.model = [this.low, this.model[1]];
    },
    high() {
      this.model = [this.model[0], this.high];
    },
  },
});
</script>
