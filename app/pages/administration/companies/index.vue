<script setup lang="ts">
import type { DataTableHeader } from 'vuetify'
import { Notify } from '~/stores/notification'

type Company = { id: string; name: string; legalName: string; status: string }

definePageMeta({
  icon: 'mdi-domain',
  title: 'Companies',
  drawerIndex: 74,
  requiresAuth: true,
  requiresAdmin: true,
  layout: 'administration',
  middleware: ['auth', 'admin-access'],
})

const rows = ref<Company[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const search = ref('')
const filters = ref<Record<string, string>>({ status: '' })

const columns: DataTableHeader[] = [
  { title: 'ID', key: 'id' },
  { title: 'Name', key: 'name' },
  { title: 'Legal name', key: 'legalName' },
  { title: 'Status', key: 'status' },
]

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

async function loadRows() {
  loading.value = true
  error.value = null
  try {
    const response = await $fetch('/api/companies', {
      query: { search: search.value || undefined, status: filters.value.status || undefined, page: page.value, limit: pageSize.value },
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
  Notify.info('TODO: brancher la création de société.')
}

watch([page, pageSize], loadRows)
watchDebounced([search, filters], loadRows, { debounce: 300, maxWait: 1000 })

onMounted(loadRows)
</script>

<template>
  <AdminResourcePage
    title="Companies"
    description="Prototype standardisé companies (toolbar + table + détail + édition + suppression)."
    :columns="columns"
    :rows="rows"
    :loading="loading"
    :error="error"
    :total="total"
    :page="page"
    :page-size="pageSize"
    :search="search"
    :filters="filters"
    :filter-configs="[{ key: 'status', label: 'Filtre statut', icon: 'mdi-filter' }]"
    :detail-fields="[
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Name' },
      { key: 'legalName', label: 'Legal name' },
      { key: 'status', label: 'Status' },
    ]"
    :editable-fields="[
      { key: 'name', label: 'Name' },
      { key: 'legalName', label: 'Legal name' },
      { key: 'status', label: 'Status' },
    ]"
    :can-show="true"
    :can-create="true"
    :can-edit="true"
    :can-delete="true"
    resource-name="la société"
    create-label="Créer une société"
    @update:page="page = $event"
    @update:page-size="pageSize = $event"
    @update:search="search = $event"
    @update:filters="filters = $event"
    @create="createRow"
    @refresh="loadRows"
  />
</template>
