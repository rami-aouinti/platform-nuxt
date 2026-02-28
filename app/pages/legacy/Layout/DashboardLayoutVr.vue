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
      <Transition mode="out-in">
        <!-- your content here -->
        <router-view></router-view>
      </Transition>
    </v-main>
    <content-footer v-if="!$route.meta.hideFooter"></content-footer>
  </v-app>
</template>
<script setup lang="ts">
import { ref } from "vue";
import Drawer from "@/components/App/AppDrawer.vue";
import AppBar from "@/components/App/AppBar.vue";
import ContentFooter from "@/components/App/AppFooter.vue";
const drawer = ref(null);
</script>
<style lang="scss"></style>
