<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    message?: string
    icon?: string
  }>(),
  {
    title: 'Aucune donnée disponible',
    message: 'Aucun résultat ne correspond à votre recherche.',
    icon: 'mdi-database-off-outline',
  },
)
</script>

<template>
  <div class="admin-state admin-state--empty text-center py-8 px-4">
    <v-icon :icon="icon" size="42" class="mb-3 text-medium-emphasis" />
    <h2 class="admin-state__title text-h6 mb-2">{{ title }}</h2>
    <p class="admin-state__message text-medium-emphasis mb-4">{{ message }}</p>
    <slot name="actions" />
  </div>
</template>
