<script setup lang="ts">
definePageMeta({
  icon: 'mdi-bell-outline',
  title: 'Notification Management',
  subtitle: 'Notification Management Administration',
  drawerIndex: 3,
  requiresAuth: true,
  requiresAdmin: true,
  layout: 'administration',
  middleware: ['auth', 'admin-access'],
})
</script>
<template>
  <NuxtPage />
</template>
