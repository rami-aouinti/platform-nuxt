<script setup lang="ts">
definePageMeta({
  icon: 'mdi-home',
  title: 'Homepage',
  drawerIndex: 0,
})
</script>

<template>
  <v-container fluid class="home-page pa-6 pa-md-10">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-card class="pa-6 pa-md-10" rounded="xl" elevation="10">
          <v-chip color="primary" variant="tonal" class="mb-4">
            Bienvenue
          </v-chip>
          <h1 class="text-h3 font-weight-bold mb-4">Homepage</h1>
          <p class="text-body-1 text-medium-emphasis mb-0">
            Ceci est la page d'accueil de l'application. Utilisez le menu de navigation
            pour accéder aux différents modules.
          </p>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.home-page {
  min-height: calc(100vh - 64px);
}
</style>
