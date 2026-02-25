<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    message?: string | null
    statusCode?: number | null
  }>(),
  {
    message: null,
    statusCode: null,
  },
)

const resolvedMessage = computed(() => {
  if (props.message) {
    return props.message
  }

  if (props.statusCode === 403) {
    return 'Accès refusé (403) : vous n’avez pas les permissions nécessaires pour cette action.'
  }

  return 'Une erreur est survenue.'
})
</script>

<template>
  <v-alert
    v-if="message || statusCode"
    type="error"
    variant="tonal"
    density="comfortable"
    class="mb-4"
  >
    {{ resolvedMessage }}
  </v-alert>
</template>
