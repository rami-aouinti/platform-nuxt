<script setup lang="ts">
const route = useRoute()

const projectId = computed(() => {
  const params = route.params as Record<string, string | string[] | undefined>
  const id = params.id

  if (Array.isArray(id)) {
    return id[0] ?? ''
  }

  return id ?? ''
})

definePageMeta({
  title: 'Project details',
  icon: 'mdi-briefcase-search-outline',
  requiresAuth: true,
  layout: 'default',
  middleware: ['auth'],
})
</script>

<template>
  <ProjectDetailsPage :project-id="projectId" />
</template>
