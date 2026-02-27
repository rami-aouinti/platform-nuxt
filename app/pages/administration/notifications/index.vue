<script setup lang="ts">
import type { DataTableHeader } from 'vuetify'
import { Notify } from '~/stores/notification'
import { extractCollectionFromPayload } from '~/utils/admin/extractCollectionFromPayload'

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

const columns: DataTableHeader[] = [
  { title: 'ID', key: 'id' },
  { title: 'Title', key: 'title' },
  { title: 'Message', key: 'message' },
  { title: 'Read', key: 'read' },
  { title: 'Created at', key: 'createdAt' },
]

function normalize(payload: unknown): NotificationRecord[] {
  return extractCollectionFromPayload(payload).map((entry, index) => {
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

const {
  rows,
  loading,
  error,
  total,
  page,
  pageSize,
  search,
  filters,
  loadRows,
} = useAdminResourcePage<NotificationRecord, Record<string, string>>({
  initialFilters: { read: '' },
  normalize,
  loadRows: async ({ search, filters, page, pageSize }) => {
    const payload = await $fetch('/api/notifications', {
      query: { search: search || undefined, read: filters.read || undefined, page, limit: pageSize },
    })

    return { payload }
  },
})

function createRow() {
  Notify.info('TODO: brancher l’envoi d’une notification.')
}

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
