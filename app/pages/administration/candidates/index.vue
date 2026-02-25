<script setup lang="ts">
definePageMeta({
  icon: 'mdi-account-search',
  title: 'Candidates',
  drawerIndex: 75,
  requiresAuth: true,
  middleware: ['auth'],
})

type Candidate = { id: string; firstName: string; lastName: string; email: string; status?: string }

const rows = ref<Candidate[]>([])
const loading = ref(false)

function normalize(payload: unknown): Candidate[] {
  const list = Array.isArray(payload)
    ? payload
    : payload && typeof payload === 'object' && Array.isArray((payload as { items?: unknown[] }).items)
      ? (payload as { items: unknown[] }).items
      : payload && typeof payload === 'object' && Array.isArray((payload as { data?: unknown[] }).data)
        ? (payload as { data: unknown[] }).data
        : []

  return list.map((entry, index) => {
    const row = entry as Record<string, unknown>
    return {
      id: String(row.id ?? row.uuid ?? index),
      firstName: String(row.firstName ?? ''),
      lastName: String(row.lastName ?? ''),
      email: String(row.email ?? ''),
      status: String(row.status ?? ''),
    }
  })
}

async function loadCandidates() {
  loading.value = true
  try {
    rows.value = normalize(await $fetch('/api/candidates'))
  } finally {
    loading.value = false
  }
}

onMounted(loadCandidates)
</script>

<template>
  <v-container fluid class="pa-6">
    <v-card rounded="xl" elevation="6" class="pa-6">
      <div class="d-flex align-center justify-space-between mb-4">
        <h1 class="text-h4 font-weight-bold">Candidates</h1>
        <v-btn prepend-icon="mdi-refresh" :loading="loading" @click="loadCandidates">Recharger</v-btn>
      </div>
      <v-table>
        <thead><tr><th>ID</th><th>Nom</th><th>Email</th><th>Status</th><th /></tr></thead>
        <tbody>
          <tr v-for="item in rows" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.firstName }} {{ item.lastName }}</td>
            <td>{{ item.email }}</td>
            <td>{{ item.status || '-' }}</td>
            <td><v-btn size="small" variant="text" :to="`/administration/candidates/${item.id}`">Détail</v-btn></td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </v-container>
</template>
