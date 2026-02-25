<script setup lang="ts">
import { FORBIDDEN_MESSAGE } from '~/utils/permissions/messages'
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
    return FORBIDDEN_MESSAGE
  }

  return 'Une erreur est survenue.'
})
</script>

<template>
  <v-alert
    v-if="props.message || props.statusCode"
    type="error"
    variant="tonal"
    density="comfortable"
    class="mb-4"
  >
    {{ resolvedMessage }}
  </v-alert>
</template>
