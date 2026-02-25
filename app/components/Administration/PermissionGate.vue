<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    allowed: boolean
    mode?: 'hide' | 'alert'
    message?: string
    alertType?: 'info' | 'warning' | 'error' | 'success'
  }>(),
  {
    mode: 'hide',
    message: 'Accès refusé : vous ne disposez pas des permissions nécessaires.',
    alertType: 'warning',
  },
)
</script>

<template>
  <template v-if="props.allowed">
    <slot />
  </template>

  <slot v-else name="fallback">
    <v-alert
      v-if="props.mode === 'alert'"
      :type="props.alertType"
      variant="tonal"
      density="comfortable"
    >
      {{ props.message }}
    </v-alert>
  </slot>
</template>
