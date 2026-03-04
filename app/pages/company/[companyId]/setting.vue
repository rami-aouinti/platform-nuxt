<script setup lang="ts">
definePageMeta({ middleware: ['auth'], requiresAuth: true })
</script>

<template>
  <CompanyWorkspaceLayout active-page="setting">
    <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
      Company setting
    </h1>
  </CompanyWorkspaceLayout>
</template>
