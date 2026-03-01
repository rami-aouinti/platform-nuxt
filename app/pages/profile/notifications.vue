<script setup lang="ts">
definePageMeta({
  icon: 'mdi-bell',
  title: 'Notifications',
  middleware: 'auth',
  requiresAuth: true,
})
</script>

<template>
  <v-container fluid>
    <v-card rounded="xl" class="pa-6">
      <h1 class="text-h4 mb-2">Notifications</h1>
      <p class="text-body-1 text-medium-emphasis mb-0">Cette page est dédiée aux préférences de notification.</p>
    </v-card>
  </v-container>
</template>
