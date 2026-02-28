<template>
  <v-app>
    <v-main class="auth-pages">
      <div
        class="header-auth position-relative ma-4 pb-30 pt-30 border-radius-xl min-vh-50"
        :style="
          this.$route.name == 'Pricing'
            ? `background-image: url(${bgPricingImageUrl}); background-size: cover; background-position: 50%;`
            : ''
        "
      >
        <v-container fluid>
          <v-row class="d-flex mt-5">
            <v-col cols="12" md="6" class="mx-auto py-0">
              <h2
                class="text-h2 font-weight-bold text-white text-center mb-2"
                v-if="this.$route.name == 'Pricing'"
              >
                {{ headerTitle() }}
              </h2>
              <h1
                class="text-h1 text-white font-weight-bolder text-center mb-2 mt-5"
                v-else
              >
                {{ headerTitle() }}
              </h1>
              <p
                class="text-white font-size-root text-center font-weight-thin mb-12"
              >
                {{ paragraphs }}
              </p>
            </v-col>
          </v-row>
        </v-container>
      </div>
      <app-bar-auth background="transparent" has-bg linkColor="white">
      </app-bar-auth>
      <Transition mode="out-in">
        <v-container fluid class="pb-0 px-16">
          <NuxtPage />
          <content-footer auth v-if="!$route.meta.hideFooter"></content-footer>
        </v-container>
      </Transition>
    </v-main>
  </v-app>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import AppBarAuth from '@/components/AppBarAuth'
import ContentFooter from '@/components/App/AppFooter.vue'
const bgPricingImageUrl = new URL('../../assets/img/bg-pricing.jpg', import.meta.url).href
const paragraphs = ref('')
function headerTitle() {
  switch ($route.name) {
    case 'Pricing':
      paragraphs.value =
        'You have Free Unlimited Updates and Premium Support on each package.'
      return 'Pick the best plan for you'
    case 'SignUpBasic':
      paragraphs.value =
        'Use these awesome forms to login or create new account in your project for free.'
      return 'Welcome!'
    case 'Register':
      paragraphs.value =
        'Use these awesome forms to login or create new account in your project for free.'
      return 'Create an account'
    case 'Lock':
      paragraphs.value = 'Better to be safe than sorry.'
      return 'Lock screen'
    default:
      break
  }
}
</script>
