<script setup lang="ts">
import { Notify } from '~/stores/notification'

definePageMeta({
  icon: 'mdi-bell-outline',
  title: 'Notifications',
  drawerIndex: 76,
  requiresAuth: true,
  middleware: ['auth'],
})

type NotificationRow = { id: string; title: string; message: string; read: boolean; createdAt?: string }

const rows = ref<NotificationRow[]>([])
const loading = ref(false)
const unreadCount = ref(0)

function normalize(payload: unknown): NotificationRow[] {
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
      title: String(row.title ?? ''),
      message: String(row.message ?? ''),
      read: Boolean(row.read),
      createdAt: String(row.createdAt ?? ''),
    }
  })
}

async function load() {
  loading.value = true
  try {
    const [listResponse, unreadResponse] = await Promise.all([
      $fetch('/api/notifications'),
      $fetch('/api/notifications/unread-count'),
    ])

    rows.value = normalize(listResponse)
    unreadCount.value = typeof unreadResponse === 'number'
      ? unreadResponse
      : Number((unreadResponse as { count?: number })?.count ?? 0)
  } finally {
    loading.value = false
  }
}

async function markAsRead(id: string) {
  await $fetch(`/api/notifications/${encodeURIComponent(id)}/read`, { method: 'PATCH' as never })
  Notify.success('Notification marquée comme lue.')
  await load()
}

async function markAllAsRead() {
  await $fetch('/api/notifications/read-all', { method: 'PATCH' as never })
  Notify.success('Toutes les notifications sont lues.')
  await load()
}

onMounted(load)
</script>

<template>
  <v-container fluid class="pa-6">
    <v-card rounded="xl" elevation="6" class="pa-6">
      <div class="d-flex align-center justify-space-between mb-4">
        <h1 class="text-h4 font-weight-bold">Notifications</h1>
        <div class="d-flex ga-2">
          <v-chip color="primary" variant="tonal">Non lues: {{ unreadCount }}</v-chip>
          <v-btn prepend-icon="mdi-bell-check-outline" :loading="loading" @click="markAllAsRead">Tout lire</v-btn>
          <v-btn prepend-icon="mdi-refresh" :loading="loading" @click="load">Recharger</v-btn>
        </div>
      </div>

      <v-table>
        <thead><tr><th>ID</th><th>Titre</th><th>Message</th><th>État</th><th /></tr></thead>
        <tbody>
          <tr v-for="item in rows" :key="item.id">
            <td>{{ item.id }}</td><td>{{ item.title }}</td><td>{{ item.message }}</td>
            <td>
              <v-chip :color="item.read ? 'success' : 'warning'" size="small" variant="tonal">{{ item.read ? 'Lue' : 'Non lue' }}</v-chip>
            </td>
            <td class="d-flex ga-2">
              <v-btn size="small" variant="text" :to="`/administration/notifications/${item.id}`">Détail</v-btn>
              <v-btn v-if="!item.read" size="small" variant="text" @click="markAsRead(item.id)">Lire</v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </v-container>
</template>
