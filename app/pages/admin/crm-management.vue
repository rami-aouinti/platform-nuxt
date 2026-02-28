<script setup lang="ts">
definePageMeta({
  icon: 'mdi-account-multiple-outline',
  title: 'Crm Management',
  subtitle: 'Crm Management Administration',
  drawerIndex: 7,
  requiresAuth: true,
  requiresAdmin: true,
  layout: 'administration',
  middleware: ['auth', 'admin-access'],
})
</script>
<template>
  <NuxtPage />
</template>
