<script setup lang="ts">
definePageMeta({
  title: 'Task requests',
  icon: 'mdi-clipboard-alert-outline',
  requiresAuth: true,
  layout: 'default',
  middleware: ['auth'],
})
</script>

<template>
  <TaskRequestLists />
</template>
