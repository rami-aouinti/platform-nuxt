<script setup lang="ts">
definePageMeta({ requiresAuth: true, middleware: ['auth'] })

const route = useRoute()
const candidateId = computed(() => {
  const value = (route.params as Record<string, string | string[] | undefined>).id
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '')
})
const candidate = ref<Record<string, unknown> | null>(null)

onMounted(async () => {
  if (!candidateId.value) return
  const endpoint = `/api/candidates/${encodeURIComponent(candidateId.value)}`
  candidate.value = await $fetch(endpoint)
})
</script>

<template>
  <v-container fluid class="pa-6">
    <v-card rounded="xl" elevation="6" class="pa-6">
      <div class="d-flex align-center justify-space-between mb-4">
        <h1 class="text-h4 font-weight-bold">Candidate {{ candidateId }}</h1>
        <v-btn variant="text" to="/admin/candidates">Retour</v-btn>
      </div>
      <v-card variant="tonal" class="pa-4"><pre class="text-body-2">{{ candidate }}</pre></v-card>
    </v-card>
  </v-container>
</template>
