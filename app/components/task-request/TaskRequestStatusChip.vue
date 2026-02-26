<script setup lang="ts">
import { TaskRequestStatus } from '~/types/task-manager'

const props = defineProps<{ status: TaskRequestStatus }>()

const config = computed(() => {
  switch (props.status) {
    case TaskRequestStatus.APPROVED:
      return { label: 'Approuvée', status: 'success' as const }
    case TaskRequestStatus.REJECTED:
      return { label: 'Rejetée', status: 'error' as const }
    case TaskRequestStatus.CANCELED:
      return { label: 'Annulée', status: 'neutral' as const }
    default:
      return { label: 'En attente', status: 'warning' as const }
  }
})
</script>

<template>
  <AdminBadge :label="config.label" :status="config.status" />
</template>
