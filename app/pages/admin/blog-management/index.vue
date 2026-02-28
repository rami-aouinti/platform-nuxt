<script setup lang="ts">
definePageMeta({
  icon: 'mdi-post-outline',
  title: 'Blog Management',
  subtitle: 'Gestion des posts, tags, commentaires et liens',
  drawerIndex: 6,
  requiresAuth: true,
  requiresAdmin: true,
  layout: 'administration',
  middleware: ['auth', 'admin-access'],
})
</script>

<template>
  <BlogManager />
</template>
