<template>
  <v-app-bar color="transparent" flat>
    <NuxtLink to="/" class="text-decoration-none text-white font-weight-bold text-h6">
      BroWorld
    </NuxtLink>
    <v-spacer />
    <v-btn variant="text" color="white" to="/login">{{ t('auth.signIn') }}</v-btn>
    <v-btn variant="outlined" color="white" to="/register">{{ t('auth.signUp') }}</v-btn>
  </v-app-bar>
</template>

<script setup lang="ts">
const { t } = useI18n()
</script>
