<script setup lang="ts">
definePageMeta({
  icon: 'mdi-domain',
  title: 'Companies',
  drawerIndex: 74,
  requiresAuth: true,
  middleware: ['auth'],
})

type Company = { id: string; name: string; legalName?: string; status?: string }

const loading = ref(false)
const rows = ref<Company[]>([])

function normalize(payload: unknown): Company[] {
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
      name: String(row.name ?? ''),
      legalName: String(row.legalName ?? ''),
      status: String(row.status ?? ''),
    }
  })
}

async function loadCompanies() {
  loading.value = true
  try {
    rows.value = normalize(await $fetch('/api/companies'))
  } finally {
    loading.value = false
  }
}

onMounted(loadCompanies)
</script>

<template>
  <v-container fluid class="pa-6">
    <v-card rounded="xl" elevation="6" class="pa-6">
      <div class="d-flex align-center justify-space-between mb-4">
        <h1 class="text-h4 font-weight-bold">Companies</h1>
        <v-btn prepend-icon="mdi-refresh" :loading="loading" @click="loadCompanies">Recharger</v-btn>
      </div>

      <v-table>
        <thead>
          <tr><th>ID</th><th>Name</th><th>Legal name</th><th>Status</th><th /></tr>
        </thead>
        <tbody>
          <tr v-for="item in rows" :key="item.id">
            <td>{{ item.id }}</td><td>{{ item.name }}</td><td>{{ item.legalName || '-' }}</td><td>{{ item.status || '-' }}</td>
            <td><v-btn size="small" variant="text" :to="`/administration/companies/${item.id}`">Détail</v-btn></td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </v-container>
</template>
