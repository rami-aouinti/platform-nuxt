<script setup lang="ts">
definePageMeta({
  icon: 'mdi-security',
  title: '2FA',
  middleware: 'auth',
  requiresAuth: true,
})
</script>

<template>
  <v-container fluid>
    <v-card rounded="xl" class="pa-6">
      <h1 class="text-h4 mb-2">2FA</h1>
      <p class="text-body-1 text-medium-emphasis mb-0">Cette page est dédiée à l'authentification à deux facteurs.</p>
    </v-card>
  </v-container>
</template>
