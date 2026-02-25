<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    label: string
    status?: 'success' | 'warning' | 'error' | 'info' | 'neutral'
    variant?: 'flat' | 'tonal' | 'outlined' | 'text'
    size?: 'x-small' | 'small' | 'default' | 'large' | 'x-large'
  }>(),
  {
    status: 'neutral',
    variant: 'tonal',
    size: 'small',
  },
)

const statusClass = computed(() => `admin-badge--${props.status}`)
</script>

<template>
  <v-chip
    :variant="variant"
    :size="size"
    class="admin-badge"
    :class="statusClass"
    label
  >
    {{ label }}
  </v-chip>
</template>
