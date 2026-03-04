<script setup lang="ts">
definePageMeta({ middleware: ['auth'], requiresAuth: true })
</script>

<template>
  <CompanyProjectWorkspaceLayout active-page="repositories">
    <h1 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Repositories</h1>
    <v-alert type="info" variant="tonal" density="comfortable" rounded="lg">
      Contenu Repositories à venir.
    </v-alert>
  </CompanyProjectWorkspaceLayout>
</template>
