<script setup lang="ts">
definePageMeta({
  icon: 'mdi-chat-processing-outline',
  title: 'Chat',
  requiresAuth: true,
  middleware: ['auth'],
})
</script>

<template>
  <v-container fluid class="py-6">
    <ChatWorkspace />
  </v-container>
</template>
