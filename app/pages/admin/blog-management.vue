<script setup lang="ts">
definePageMeta({
  icon: 'mdi-book-open-outline',
  title: 'Blog Management',
  subtitle: 'Blog Management Administration',
  drawerIndex: 6,
  requiresAuth: true,
  requiresAdmin: true,
  layout: 'administration',
  middleware: ['auth', 'admin-access'],
})
</script>
<template>
  <NuxtPage />
</template>
