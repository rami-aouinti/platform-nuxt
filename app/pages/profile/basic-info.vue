<script setup lang="ts">
definePageMeta({
  icon: 'mdi-receipt',
  title: 'Basic Info',
  middleware: 'auth',
  requiresAuth: true,
})
</script>

<template>
  <v-container fluid>
    <v-card rounded="xl" class="pa-6">
      <h1 class="text-h4 mb-2">Basic Info</h1>
      <p class="text-body-1 text-medium-emphasis mb-0">Cette page est dédiée aux informations de base du profil.</p>
    </v-card>
  </v-container>
</template>
