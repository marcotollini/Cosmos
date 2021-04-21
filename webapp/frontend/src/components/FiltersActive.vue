<template>
  <draggable
    tag="div"
    v-model="fields"
    :item-key="() => element"
    group="filter"
    @add="fieldAdd"
  >
    <template #item="{element}">
      <cs-tag-filtrable
        :values="values[element]"
        v-model:selected="selected[element]"
        :loading="loading[element]"
        @open="onOpen(element)"
        @close="onClose(element)"
        @delete="onDelete(element)"
        >{{ element }}</cs-tag-filtrable
      >
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
import {cloneDeep, isEqual, pickBy} from 'lodash';

export default defineComponent({
  name: 'FiltersPlacable',
  components: {
    Draggable,
    csTagFiltrable,
  },
  data() {
    return {
      fields: [] as string[],
      values: {} as Record<string, string[]>,
      selected: {} as Record<string, string[]>,
      loading: {} as Record<string, boolean>,
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
  watch: {
    selected: {
      handler() {
        const unemptyFilters = pickBy(this.selected, x => x.length !== 0);
        if (!isEqual(this.activeFilters, unemptyFilters)) {
          this.$store.commit('activeFilters', cloneDeep(unemptyFilters));
        }
      },
      deep: true,
    },
  },
  methods: {
    async onOpen(id: string) {
      const timestamp = this.selectedTimestamp;
      const vpn = this.selectedVPN;
      if (timestamp === undefined || vpn === undefined) return;

      this.loading[id] = true;

      try {
        const filters = {} as Record<string, any>;
        for (const field of this.fields) {
          if (field === id) {
            break;
          }
          filters[field] = this.activeFilters[field];
        }

        const result = await this.$http.post(
          `api/bmp/filter/field/values/${id}`,
          {
            data: {timestamp, vpn, filters},
            headers: {
              REQUEST_ID: `field_values_${id}`,
              THROTTLE: '1000',
              CANCEL: 'true',
            },
          }
        );
        this.values[id] = result.data;
      } catch (e) {
        if (e.__CANCEL__) {
          console.log('Request cancelled');
        } else if (e.name === 'REQABORTTHROTTLE') {
          console.log('request aborted due to throttle policy');
        } else {
          console.error(e.stack, e);
        }
      } finally {
        this.loading[id] = false;
      }
    },
    onClose(id: string) {
      this.values[id] = [];

      if (this.selected[id].length === 0) {
        this.deleteTag(id);
      }
    },
    onDelete(id: string) {
      this.deleteTag(id);
    },
    deleteTag(id: string) {
      delete this.values[id];
      delete this.selected[id];
      delete this.loading[id];

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
