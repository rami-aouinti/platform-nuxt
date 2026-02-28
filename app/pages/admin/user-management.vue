<script setup lang="ts">
definePageMeta({
  icon: 'mdi-account-multiple-outline',
  title: 'User Management',
  subtitle: 'User Management Administration',
  drawerIndex: 2,
  requiresAuth: true,
  requiresAdmin: true,
  layout: 'administration',
  middleware: ['auth', 'admin-access'],
})
</script>
<template>
  <NuxtPage />
</template>
