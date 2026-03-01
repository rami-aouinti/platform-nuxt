<script setup lang="ts">
definePageMeta({
  icon: 'mdi-clipboard-account',
  title: 'Accounts',
  middleware: 'auth',
  requiresAuth: true,
})
</script>

<template>
  <v-container fluid>
    <v-card rounded="xl" class="pa-6">
      <h1 class="text-h4 mb-2">Accounts</h1>
      <p class="text-body-1 text-medium-emphasis mb-0">Cette page est dédiée à la gestion des comptes liés.</p>
    </v-card>
  </v-container>
</template>
