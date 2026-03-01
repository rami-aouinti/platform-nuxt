<template>
  <v-app-bar class="border-b" color="white" elevation="1">
    <NuxtLink to="/" class="text-decoration-none text-primary font-weight-bold text-h6">
      BroWorld
    </NuxtLink>
    <v-spacer />
    <v-btn variant="text" color="primary" to="/login">{{ t('auth.signIn') }}</v-btn>
  </v-app-bar>
</template>

<script setup lang="ts">
const { t } = useI18n()
</script>
