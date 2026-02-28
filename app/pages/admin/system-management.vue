<script setup lang="ts">
definePageMeta({
  icon: 'mdi-settings-outline',
  title: 'System Management',
  subtitle: 'System Management Administration',
  drawerIndex: 1,
  requiresAuth: true,
  requiresAdmin: true,
  layout: 'administration',
  middleware: ['auth', 'admin-access'],
})
</script>
<template>
  <NuxtPage />
</template>
