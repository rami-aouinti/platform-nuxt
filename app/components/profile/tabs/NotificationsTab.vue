<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>

<template>
  <v-card class="profile-block pa-4 pa-md-6" rounded="xl" elevation="0">
    <h3 class="text-h4 text-typo mb-2">{{ title }}</h3>
    <p class="text-body-1 text-medium-emphasis mb-0">{{ description }}</p>
  </v-card>
</template>
