<template>
  <v-app class="virtual-reality">
    <div>
      <app-bar
        background="bg-transparent"
        has-bg
        @drawer-toggle="drawer = $event"
        :toggle-active="drawer"
      ></app-bar>
    </div>
    <v-main
      class="mt-4 mx-4 border-radius-xl position-relative"
      :style="`background-image: url(${new URL('../../assets/img/vr-bg.jpg', import.meta.url).href}); background-size: cover;`"
    >
      <drawer :drawer="drawer" class="bg-white border-radius-xl"></drawer>
      <fade-transition :duration="200" origin="center top" mode="out-in">
        <!-- your content here -->
        <router-view></router-view>
      </fade-transition>
    </v-main>
    <content-footer v-if="!$route.meta.hideFooter"></content-footer>
  </v-app>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
// /* eslint-disable no-new */
import PerfectScrollbar from "perfect-scrollbar";
import "perfect-scrollbar/css/perfect-scrollbar.css";
// import DashboardNavbar from './DashboardNavbar.vue';
import { FadeTransition } from "vue2-transitions";
import Drawer from "@/components/App/AppDrawer.vue";
import AppBar from "@/components/App/AppBar.vue";
import ContentFooter from "@/components/App/AppFooter.vue";
function hasElement(className: string) {
  return document.getElementsByClassName(className).length > 0;
}
function initScrollbarElement(className: string) {
  if (hasElement(className)) {
    new PerfectScrollbar(`.${className}`);
  } else {
    // try to init it later in case this component is loaded async
    setTimeout(() => {
      initScrollbarElement(className);
    }, 100);
  }
}
const drawer = ref(null);
function initScrollbar() {
  let isWindows = navigator.platform.startsWith("Win");
  if (isWindows) {
    initScrollbarElement("sidenav");
  }
}
onMounted(() => {
  initScrollbar();
});
</script>
<style lang="scss"></style>
