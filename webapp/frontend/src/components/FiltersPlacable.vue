<template>
  <draggable tag="div" v-model="fields" group="filter">
    <template #item="{element}">
      <cs-tag-filtrable>{{ element }}</cs-tag-filtrable>
    </template>
  </draggable>
</template>

<script lang="ts">
import {defineComponent, DefineComponent} from 'vue';
import draggable from 'vuedraggable';
import csTagFiltrable from '@/components/CS/cs-tag-filterable.vue';

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
  name: 'FiltersPlacable',
  components: {
    Draggable,
    csTagFiltrable,
  },
  data() {
    return {
      fields: [] as string[],
    };
  },
  computed: {
    selectedTimestamp() {
      return this.$store.state.selectedTimestamp;
    },

    selectedVPN() {
      return this.$store.state.selectedVPN;
    },

    activeFilters() {
      return this.$store.state.activeFilters;
    },
  },
});
</script>

<style scoped>
.el-tag {
  margin: 5px;
}
</style>
