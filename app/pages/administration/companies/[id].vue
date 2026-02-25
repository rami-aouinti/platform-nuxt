<script setup lang="ts">
definePageMeta({
  requiresAuth: true,
  middleware: ['auth'],
})

const route = useRoute()
const companyId = computed(() => {
  const value = (route.params as Record<string, string | string[] | undefined>).id
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '')
})
const company = ref<Record<string, unknown> | null>(null)
const members = ref<Record<string, unknown>[]>([])
const loading = ref(false)

async function loadDetail() {
  if (!companyId.value) return
  loading.value = true
  try {
    const [detail, membersResponse] = await Promise.all([
      $fetch(`/api/companies/${encodeURIComponent(companyId.value)}`),
      $fetch(`/api/companies/${encodeURIComponent(companyId.value)}/members`),
    ])
    company.value = (detail as Record<string, unknown>) ?? null
    members.value = Array.isArray(membersResponse)
      ? (membersResponse as Record<string, unknown>[])
      : (membersResponse && typeof membersResponse === 'object' && Array.isArray((membersResponse as { items?: unknown[] }).items)
          ? ((membersResponse as { items: unknown[] }).items as Record<string, unknown>[])
          : [])
  } finally {
    loading.value = false
  }
}

onMounted(loadDetail)
</script>

<template>
  <v-container fluid class="pa-6">
    <v-card rounded="xl" elevation="6" class="pa-6">
      <div class="d-flex align-center justify-space-between mb-4">
        <h1 class="text-h4 font-weight-bold">Company {{ companyId }}</h1>
        <v-btn variant="text" to="/administration/companies">Retour</v-btn>
      </div>
      <v-progress-linear v-if="loading" indeterminate class="mb-4" />

      <v-card variant="tonal" class="pa-4 mb-4">
        <pre class="text-body-2">{{ company }}</pre>
      </v-card>

      <v-card variant="tonal" class="pa-4">
        <div class="text-subtitle-1 mb-2">Membres ({{ members.length }})</div>
        <v-list>
          <v-list-item
v-for="(member, index) in members" :key="String(member.id ?? member.uuid ?? member.email ?? index)"
            :title="String(member.username ?? member.name ?? member.id ?? '-')"
            :subtitle="String(member.email ?? '')"
          />
        </v-list>
      </v-card>
    </v-card>
  </v-container>
</template>
