<script setup lang="ts">
definePageMeta({
  icon: 'mdi-account-multiple-outline',
  title: 'Recruit Management',
  subtitle: 'Recruit Management Administration',
  drawerIndex: 5,
  requiresAuth: true,
  requiresAdmin: true,
  layout: 'administration',
  middleware: ['auth', 'admin-access'],
})
</script>
<template>
  <NuxtPage />
</template>
