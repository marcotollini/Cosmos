<template>
  <draggable
    tag="div"
    v-model="fields"
    :item-key="() => element"
    :group="{name: 'filter', pull: 'clone', put: false}"
  >
    <template #item="{element}">
      <el-tag type="info" effect="dark">{{ element }}</el-tag>
    </template>
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
  name: 'FiltersDraggable',
  components: {
    Draggable,
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
  watch: {
    selectedTimestamp() {
      this.loadFieldsList();
    },

    selectedVPN() {
      this.loadFieldsList();
    },
  },
  methods: {
    async loadFieldsList() {
      const timestamp = this.selectedTimestamp;
      const vpn = this.selectedVPN;
      if (timestamp === undefined || vpn === undefined) return;

      const result = await this.$http.post('/api/bmp/filter/fields/list', {
        data: {timestamp, vpn, filters: this.activeFilters},
        headers: {
          REQUEST_ID: 'field_values',
          THROTTLE: '1000',
          CANCEL: 'true',
        },
      });

      const data = result.data as string[];
      this.fields = data;
    },
  },

  mounted() {
    this.loadFieldsList();
  },
});
</script>

<style scoped>
.el-tag {
  margin: 5px;
}
</style>
