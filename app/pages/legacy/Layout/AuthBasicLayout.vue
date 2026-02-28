<template>
  <v-app>
    <v-main class="auth-pages">
      <div
        class="position-relative min-vh-100"
        :style="`background-image:  url('https://images.unsplash.com/photo-1448375240586-882707db888b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1650&q=80'); background-size: cover; background-position: 50%;`"
      >
        <span class="mask bg-gradient-default opacity-6"></span>
        <v-container class="my-auto">
          <v-row class="min-vh-100">
            <app-bar-auth background="transparent" has-bg linkColor="white">
            </app-bar-auth>
            <Transition mode="out-in">
              <v-container class="pb-0 position-relative">
                <NuxtPage />
                <content-footer
                  auth
                  v-if="!$route.meta.hideFooter"
                ></content-footer>
              </v-container>
            </Transition>
          </v-row>
        </v-container>
      </div>
    </v-main>
  </v-app>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import AppBarAuth from '@/components/AppBarAuth'
import ContentFooter from '@/components/App/AppFooter.vue'
const paragraphs = ref('')
function headerTitle() {
  switch ($route.name) {
    case 'SignUpBasic':
      paragraphs.value =
        'Use these awesome forms to login or create new account in your project for free.'
      return 'Welcome!'
    default:
      break
  }
}
</script>
