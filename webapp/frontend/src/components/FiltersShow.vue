<template>
  <draggable
    tag="div"
    v-model="fields"
    :item-key="() => element"
    :group="{name: 'filter', pull: false, put: true}"
    @add="fieldAdd"
  >
    <template #item="{element}">
      <el-tag effect="dark" closable @close="tagDelete(element)">
        {{ element }}
      </el-tag>
    </template>
    <template #header> View: </template>
  </draggable>
</template>

<script lang="ts">
import {defineComponent, DefineComponent} from 'vue';
import draggable from 'vuedraggable';

/* TERRIBLE FIX WAITING FOR BETTER FIX */
/* From el-main type */
const Draggable = draggable as DefineComponent<
  // eslint-disable-next-line @typescript-eslint/ban-types
  {},
  // eslint-disable-next-line @typescript-eslint/ban-types
  {},
  // eslint-disable-next-line @typescript-eslint/ban-types
  {},
  // eslint-disable-next-line @typescript-eslint/ban-types
  {},
  // eslint-disable-next-line @typescript-eslint/ban-types
  {},
  import('vue').ComponentOptionsMixin,
  import('vue').ComponentOptionsMixin,
  import('vue').EmitsOptions,
  string,
  import('vue').VNodeProps &
    import('vue').AllowedComponentProps &
    import('vue').ComponentCustomProps,
  // eslint-disable-next-line @typescript-eslint/ban-types
  Readonly<{} & {}>,
  // eslint-disable-next-line @typescript-eslint/ban-types
  {}
>;

export default defineComponent({
  name: 'FiltersShow',
  components: {
    Draggable,
  },
  props: {
    selected: {
      default: () => [],
      type: Array,
    },
  },
  emits: ['update:selected'],
  data() {
    return {
      fields: this.selected as string[],
    };
  },
  watch: {
    selected() {
      this.fields = this.selected as string[];
    },
    fields: {
      handler() {
        this.$emit('update:selected', this.fields);
      },
      deep: true,
    },
  },
  methods: {
    tagDelete(id: string) {
      this.fields = this.fields.filter(x => x !== id);
    },
    fieldAdd() {
      this.fields = [...new Set(this.fields)];
    },
  },
});
</script>

<style scoped>
.el-tag {
  margin: 5px;
}
</style>
