<script setup lang="ts">
import type { DataTableHeader } from 'vuetify'
import { Notify } from '~/stores/notification'
import { normalizeListResponse } from '~/utils/admin/normalize-list-response'

type Candidate = { id: string; firstName: string; lastName: string; email: string; status: string }

definePageMeta({
  icon: 'mdi-account-search',
  title: 'Candidates',
  drawerIndex: 75,
  requiresAuth: true,
  requiresAdmin: true,
  layout: 'administration',
  middleware: ['auth', 'admin-access'],
})

const rows = ref<Candidate[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const search = ref('')
const filters = ref<Record<string, string>>({ status: '' })

const columns: DataTableHeader[] = [
  { title: 'ID', key: 'id' },
  { title: 'First name', key: 'firstName' },
  { title: 'Last name', key: 'lastName' },
  { title: 'Email', key: 'email' },
  { title: 'Status', key: 'status' },
]

function toCandidates(list: unknown[]): Candidate[] {
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

async function loadRows() {
  loading.value = true
  error.value = null
  try {
    const response = await $fetch('/api/candidates', {
      query: { search: search.value || undefined, status: filters.value.status || undefined, page: page.value, limit: pageSize.value },
    })
    const normalized = normalizeListResponse(response)
    rows.value = toCandidates(normalized.rows)
    total.value = normalized.total ?? rows.value.length
  } catch (errorValue) {
    error.value = errorValue instanceof Error ? errorValue.message : 'Erreur API.'
  } finally {
    loading.value = false
  }
}

function createRow() {
  Notify.info('TODO: brancher la création de candidat.')
}

watch([page, pageSize], loadRows)
watchDebounced([search, filters], loadRows, { debounce: 300, maxWait: 1000 })

onMounted(loadRows)
</script>

<template>
  <AdminResourcePage
    title="Candidates"
    description="Prototype candidates aligné sur le pattern Users."
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
      { key: 'firstName', label: 'First name' },
      { key: 'lastName', label: 'Last name' },
      { key: 'email', label: 'Email' },
      { key: 'status', label: 'Status' },
    ]"
    :editable-fields="[
      { key: 'firstName', label: 'First name' },
      { key: 'lastName', label: 'Last name' },
      { key: 'email', label: 'Email' },
      { key: 'status', label: 'Status' },
    ]"
    :can-show="true"
    :can-create="true"
    :can-edit="true"
    :can-delete="true"
    resource-name="le candidat"
    create-label="Créer un candidat"
    @update:page="page = $event"
    @update:page-size="pageSize = $event"
    @update:search="search = $event"
    @update:filters="filters = $event"
    @create="createRow"
    @refresh="loadRows"
  />
</template>
