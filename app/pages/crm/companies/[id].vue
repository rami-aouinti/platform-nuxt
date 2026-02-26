<script setup lang="ts">
const route = useRoute()

definePageMeta({
  icon: 'mdi-office-building-outline',
  title: 'CRM Company',
  requiresAuth: true,
  middleware: ['auth'],
})

const companyId = computed(() => String((route.params as { id?: string }).id || ''))
</script>

<template>
  <v-container fluid>
    <div class="d-flex align-center justify-space-between mb-4">
      <h1 class="text-h5">Company {{ companyId }}</h1>
      <v-btn variant="tonal" prepend-icon="mdi-arrow-left" to="/crm">Retour CRM</v-btn>
    </div>

    <v-alert type="info" variant="tonal">
      Page company dédiée prête pour les prochains développements.
    </v-alert>
  </v-container>
</template>
