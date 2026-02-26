<script setup lang="ts">
import { ProjectStatus } from '~/types/task-manager'

const props = defineProps<{
  status: ProjectStatus
}>()

const config = computed(() => {
  switch (props.status) {
    case ProjectStatus.ACTIVE:
      return { label: 'Actif', status: 'success' as const }
    case ProjectStatus.COMPLETED:
      return { label: 'Terminé', status: 'info' as const }
    case ProjectStatus.ARCHIVED:
      return { label: 'Archivé', status: 'neutral' as const }
    default:
      return { label: 'Brouillon', status: 'warning' as const }
  }
})
</script>

<template>
  <AdminBadge :label="config.label" :status="config.status" />
</template>
