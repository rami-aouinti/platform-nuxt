<template>
  <v-app>
    <drawer
      :drawer="drawer"
      :sidebarColor="sidebarColor"
      :sidebarTheme="sidebarTheme"
    >
    </drawer>
    <v-main>
      <div
        @click="drawer = false"
        v-if="drawer"
        class="position-absolute drawer-state"
      ></div>
      <app-bar
        v-if="$route.name != 'Profile'"
        background="bg-transparent"
        has-bg
        @drawer-toggle="drawer = $event"
        :toggle-active="drawer"
        :navbarFixed="navbarFixed"
        @toggleSettingsDrawer="toggleSettingsDrawer"
      ></app-bar>
      <app-bar
        v-else-if="$route.name == 'Profile'"
        background="bg-default"
        has-bg
        @drawer-toggle="drawer = $event"
        :toggle-active="drawer"
      ></app-bar>
      <app-bar
        v-else
        background="primary"
        linkColor="rgba(0,0,0,.6)"
        @drawer-toggle="drawer = $event"
        :toggle-active="drawer"
      ></app-bar>
      <fade-transition :duration="200" origin="center top" mode="out-in">
        <!-- your content here -->
        <NuxtPage />
      </fade-transition>
      <content-footer v-if="!$route.meta.hideFooter"></content-footer>
      <v-btn
        :ripple="false"
        icon
        rounded
        color="#fff"
        width="52px"
        height="52px"
        class="
          fixed-plugin-button
          position-fixed
          btn-light
          bg-white
          text-dark
          z-index-9999
        "
        @click="showSettingsDrawer = true"
      >
        <v-icon size="20">fa fa-cog py-2</v-icon>
      </v-btn>

      <settings-drawer
        :showSettingsDrawer="showSettingsDrawer"
        @toggleSettingsDrawer="toggleSettingsDrawer"
        @updateSidebarColor="updateSidebarColor"
        @updateSidebarTheme="updateSidebarTheme"
        @toggleNavbarPosition="toggleNavbarPosition"
      >
      </settings-drawer>
    </v-main>
  </v-app>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
// /* eslint-disable no-new */
import PerfectScrollbar from "perfect-scrollbar";
import "perfect-scrollbar/css/perfect-scrollbar.css";
import { FadeTransition } from "vue2-transitions";
import Drawer from "@/components/App/AppDrawer.vue";
import AppBar from "@/components/App/AppBar.vue";
import ContentFooter from "@/components/App/AppFooter.vue";
import SettingsDrawer from "@/components/App/AppSettings.vue";
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
const showSettingsDrawer = ref(false);
const sidebarColor = ref("success");
const sidebarTheme = ref("dark");
const navbarFixed = ref(false);
function initScrollbar() {
  let isWindows = navigator.platform.startsWith("Win");
  if (isWindows) {
    initScrollbarElement("sidenav");
  }
}
function toggleSettingsDrawer(value: boolean) {
  showSettingsDrawer.value = value;
}
function updateSidebarColor(value: string) {
  sidebarColor.value = value;
}
function updateSidebarTheme(value: string) {
  let siblings = event.target.closest("button").parentElement.children;
  for (var i = 0; i < siblings.length; i++) {
    siblings[i].classList.remove("bg-gradient-default");
    siblings[i].classList.add("btn-outline-default");
  }
  event.target.closest("button").classList.add("bg-gradient-default");
  event.target.closest("button").classList.remove("btn-outline-default");
  sidebarTheme.value = value;
}
function toggleNavbarPosition(value: boolean) {
  navbarFixed.value = value;
}
onMounted(() => {
  initScrollbar();
});
</script>
<style lang="scss"></style>
