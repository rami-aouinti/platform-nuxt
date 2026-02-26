<script setup lang="ts">
definePageMeta({
  title: 'Tasks',
  icon: 'mdi-format-list-checks',
  requiresAuth: true,
  layout: 'default',
  middleware: ['auth'],
})
</script>

<template>
  <TaskBoardAndTable />
</template>
