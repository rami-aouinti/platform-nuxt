<script setup lang="ts">
definePageMeta({
  title: 'Projects',
  icon: 'mdi-briefcase-outline',
  requiresAuth: true,
  layout: 'default',
  middleware: ['auth'],
})
</script>

<template>
  <ProjectTableList />
</template>
