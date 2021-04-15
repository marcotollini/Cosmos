<template>
  <div class="graph">
    <el-container class="el-container-global">
      <el-aside width="20%">
        <el-container class="el-container-global">
          <el-main style="border-right: 1px #909399 solid" class="mac-scroll">
            <div class="side-top">
              <load-state-form style="margin-bottom: 10px" />
              <!-- <filter-route-monitor
                :currentState="currentState"
                v-model="filtersLoaded"
              /> -->
            </div>
          </el-main>
          <el-footer class="side-bottom" height="200px">Footer</el-footer>
        </el-container>
      </el-aside>
      <el-container>
        <el-main> Cytograph </el-main>
        <el-footer height="200px" class="timeseries"> timechart </el-footer>
      </el-container>
    </el-container>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import LoadStateForm from '@/components/LoadStateForm.vue';

export default defineComponent({
  name: 'Graph',
  components: {
    LoadStateForm,
  },
  data() {
    return {};
  },
  watch: {},
  methods: {},
});
</script>

<style>
body {
  margin: 0;
  color: #333;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB';
  overflow-y: hidden;
}

.side-elem-width {
  width: 95% !important;
  margin-top: 5px;
}

.text-center {
  text-align: center;
}

.text-left .el-notification__content p {
  text-align: left !important;
}
</style>

<style scoped>
.el-header,
.el-footer {
  background-color: #b3c0d1;
}

.el-aside {
  background-color: #d3dce6;
  min-width: 250px;
}

.el-main {
  background-color: #e9eef3;
  margin: 0;
  padding: 0;
}

.el-container-global {
  height: 100vh;
}

.timeseries {
  background: #e9eef3;
  border-top: #909399 solid 1px;
}

.mac-scroll::-webkit-scrollbar {
  background-color: #fff;
  width: 16px;
}

/* background of the scrollbar except button or resizer */
.mac-scroll::-webkit-scrollbar-track {
  background-color: #fff;
}

/* scrollbar itself */
.mac-scroll::-webkit-scrollbar-thumb {
  background-color: #babac0;
  border-radius: 16px;
  border: 4px solid #fff;
}

/* set button(top and bottom of the scrollbar) */
.mac-scroll::-webkit-scrollbar-button {
  display: none;
}
</style>
