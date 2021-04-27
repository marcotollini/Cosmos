<template>
  <div class="side-bottom-main">
    <el-container class="el-container-global">
      <el-aside :width="sideWidth">
        <el-container class="el-container-global">
          <el-main class="border-right mac-scroll">
            <div class="side-top">
              <logo></logo>
              <slot name="side-top"></slot>
            </div>
          </el-main>
        </el-container>
      </el-aside>
      <el-container>
        <el-main>
          <div class="main">
            <slot name="main"></slot>
          </div>
        </el-main>
        <el-footer class="footer border-top" :height="footerHeight">
          <slot name="footer"></slot>
        </el-footer>
      </el-container>
    </el-container>
  </div>
</template>

<script lang="ts">
/**
 * Slots: side-top, side-bottom, footer, main
 */

import {defineComponent} from 'vue';
import Logo from '@/views/Structure/Logo.vue';

export default defineComponent({
  name: 'SideBottomFourSlots',
  components: {
    Logo,
  },
  props: {
    footerHeight: {
      default: '20vh',
      type: String,
    },
    sideWidth: {
      default: '20%',
      type: String,
    },
  },
});
</script>

<style>
body {
  margin: 0;
  color: #333;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB';
  overflow-y: hidden;
}
</style>

<style scoped>
.border-right {
  border-right: 1px #909399 solid;
}

.border-top {
  border-top: #909399 solid 1px;
}

.side-top,
.side-bottom,
.main,
.footer {
  height: 100%;
  margin: 0;
  padding: 0;
}

.el-main {
  margin: 0;
  padding: 0;
}

footer {
  margin: 0;
  padding: 0;
}

.el-aside {
  min-width: 260px;
  max-width: 400px;
}

.el-container-global {
  height: 100vh;
}

.main {
  background-color: #fafafa;
}

.side-top {
  background-color: #fafafa;
}

.footer {
  background-color: #fafafa;
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
