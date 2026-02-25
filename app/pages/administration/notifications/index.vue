<script setup lang="ts">
import type { DataTableHeader } from 'vuetify'
import { Notify } from '~/stores/notification'

type NotificationRecord = { id: string; title: string; message: string; read: string; createdAt: string }

definePageMeta({
  icon: 'mdi-bell-outline',
  title: 'Notifications',
  drawerIndex: 76,
  requiresAuth: true,
  requiresAdmin: true,
  layout: 'administration',
  middleware: ['auth', 'admin-access'],
})

const rows = ref<NotificationRecord[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const search = ref('')
const filters = ref<Record<string, string>>({ read: '' })

const columns: DataTableHeader[] = [
  { title: 'ID', key: 'id' },
  { title: 'Title', key: 'title' },
  { title: 'Message', key: 'message' },
  { title: 'Read', key: 'read' },
  { title: 'Created at', key: 'createdAt' },
]

function normalize(payload: unknown): NotificationRecord[] {
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
      read: row.read ? 'Oui' : 'Non',
      createdAt: String(row.createdAt ?? ''),
    }
  })
}

async function loadRows() {
  loading.value = true
  error.value = null
  try {
    const response = await $fetch('/api/notifications', {
      query: { search: search.value || undefined, read: filters.value.read || undefined, page: page.value, limit: pageSize.value },
    })
    rows.value = normalize(response)
    total.value = rows.value.length
  } catch (errorValue) {
    error.value = errorValue instanceof Error ? errorValue.message : 'Erreur API.'
  } finally {
    loading.value = false
  }
}

function createRow() {
  Notify.info('TODO: brancher l’envoi d’une notification.')
}

watch([page, pageSize], loadRows)
watchDebounced([search, filters], loadRows, { debounce: 300, maxWait: 1000 })

onMounted(loadRows)
</script>

<template>
  <AdminResourcePage
    title="Notifications"
    description="Prototype notifications prêt à brancher aux APIs de diffusion."
    :columns="columns"
    :rows="rows"
    :loading="loading"
    :error="error"
    :total="total"
    :page="page"
    :page-size="pageSize"
    :search="search"
    :filters="filters"
    :filter-configs="[{ key: 'read', label: 'Filtre lecture (Oui/Non)', icon: 'mdi-email-check-outline' }]"
    :detail-fields="[
      { key: 'id', label: 'ID' },
      { key: 'title', label: 'Title' },
      { key: 'message', label: 'Message' },
      { key: 'read', label: 'Read' },
      { key: 'createdAt', label: 'Created at' },
    ]"
    :editable-fields="[
      { key: 'title', label: 'Title' },
      { key: 'message', label: 'Message' },
      { key: 'read', label: 'Read (Oui/Non)' },
    ]"
    :can-show="true"
    :can-create="true"
    :can-edit="true"
    :can-delete="true"
    resource-name="la notification"
    create-label="Créer une notification"
    @update:page="page = $event"
    @update:page-size="pageSize = $event"
    @update:search="search = $event"
    @update:filters="filters = $event"
    @create="createRow"
    @refresh="loadRows"
  />
</template>
