<script setup lang="ts">
definePageMeta({
  title: 'Administration',
  icon: 'mdi-shield-half-full',
  drawerIndex: 0,
  requiresAuth: true,
  requiresAdmin: true,
  layout: 'administration',
  middleware: ['auth', 'admin-access']
})
</script>

<template>
  <NuxtPage />
</template>
