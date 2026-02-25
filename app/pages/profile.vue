<script setup lang="ts">
definePageMeta({
  icon: 'mdi-account-circle-outline',
  title: 'Profile',
  middleware: 'auth',
})
</script>

<template>
  <v-container fluid class="pa-6">
    <v-card rounded="xl" elevation="6" class="pa-6">
      <h1 class="text-h4 font-weight-bold mb-2">Profile</h1>
      <p class="text-medium-emphasis mb-0">
        Votre profil utilisateur sera disponible sur cette page prochainement.
      </p>
    </v-card>
  </v-container>
</template>
