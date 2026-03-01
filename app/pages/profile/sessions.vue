<script setup lang="ts">
definePageMeta({
  icon: 'mdi-settings',
  title: 'Sessions',
  middleware: 'auth',
  requiresAuth: true,
})
</script>

<template>
  <v-container fluid>
    <v-card rounded="xl" class="pa-6">
      <h1 class="text-h4 mb-2">Sessions</h1>
      <p class="text-body-1 text-medium-emphasis mb-0">Cette page est dédiée à la gestion des sessions actives.</p>
    </v-card>
  </v-container>
</template>
