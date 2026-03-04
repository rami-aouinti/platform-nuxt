<script setup lang="ts">
definePageMeta({ middleware: ['auth'], requiresAuth: true })
</script>

<template>
  <CompanyWorkspaceLayout active-page="dashboard">
    <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
      Company dashboard
    </h1>
  </CompanyWorkspaceLayout>
</template>
