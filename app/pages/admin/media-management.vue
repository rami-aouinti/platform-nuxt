<script setup lang="ts">
definePageMeta({
  icon: 'mdi-file-image-outline',
  title: 'Media Management',
  subtitle: 'Media Management Administration',
  drawerIndex: 4,
  requiresAuth: true,
  requiresAdmin: true,
  layout: 'administration',
  middleware: ['auth', 'admin-access'],
})
</script>
<template>
  <NuxtPage />
</template>
