<script setup lang="ts">
import { TaskStatus } from '~/types/task-manager'

const props = defineProps<{ status: TaskStatus }>()

const config = computed(() => {
  switch (props.status) {
    case TaskStatus.IN_PROGRESS:
      return { label: 'En cours', status: 'warning' as const }
    case TaskStatus.COMPLETED:
      return { label: 'Terminée', status: 'success' as const }
    case TaskStatus.ARCHIVED:
      return { label: 'Archivée', status: 'neutral' as const }
    default:
      return { label: 'À faire', status: 'info' as const }
  }
})
</script>

<template>
  <AdminBadge :label="config.label" :status="config.status" />
</template>
