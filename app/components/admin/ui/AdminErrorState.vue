<script setup lang="ts">
const emit = defineEmits<{
  retry: []
}>()

withDefaults(
  defineProps<{
    title?: string
    message?: string
    icon?: string
    retryLabel?: string
    canRetry?: boolean
  }>(),
  {
    title: 'Une erreur est survenue',
    message: 'Impossible de charger les données pour le moment.',
    icon: 'mdi-alert-circle-outline',
    retryLabel: 'Réessayer',
    canRetry: true,
  },
)
</script>

<template>
  <div class="admin-state admin-state--error text-center py-8 px-4">
    <v-icon :icon="icon" size="42" class="mb-3 admin-error-color" />
    <h2 class="admin-state__title text-h6 mb-2">{{ title }}</h2>
    <p class="admin-state__message text-medium-emphasis mb-4">{{ message }}</p>

    <v-btn
      v-if="canRetry"
      variant="tonal"
      prepend-icon="mdi-refresh"
      class="admin-error-action"
      @click="emit('retry')"
    >
      {{ retryLabel }}
    </v-btn>

    <slot name="actions" />
  </div>
</template>
