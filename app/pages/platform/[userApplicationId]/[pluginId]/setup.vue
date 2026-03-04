<script setup lang="ts">
definePageMeta({
  title: 'Plugin Setup',
  icon: 'mdi-tune-variant',
  requiresAuth: true,
  layout: 'default',
  middleware: ['auth'],
})

const route = useRoute()
const userApplicationId = computed(() => String(route.params.userApplicationId ?? ''))
const pluginId = computed(() => String(route.params.pluginId ?? ''))
</script>

<template>
  <v-container fluid class="pa-6 min-h-screen">
    <v-btn
      variant="text"
      prepend-icon="mdi-arrow-left"
      :to="`/platform/${userApplicationId}/setup`"
      class="mb-4"
    >
      Retour aux plugins
    </v-btn>

    <v-card rounded="xl" elevation="2" class="pa-6">
      <h1 class="text-h5 font-weight-bold mb-2">Plugin setup</h1>
      <p class="text-body-1 mb-1">Application utilisateur: {{ userApplicationId }}</p>
      <p class="text-body-1 mb-0">Plugin: {{ pluginId }}</p>
    </v-card>
  </v-container>
</template>
