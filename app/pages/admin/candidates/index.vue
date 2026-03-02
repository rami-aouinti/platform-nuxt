<script setup lang="ts">
import type { DataTableHeader } from 'vuetify'
import { Notify } from '~/stores/notification'
import { extractCollectionFromPayload } from '~/utils/admin/extractCollectionFromPayload'

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

const columns: DataTableHeader[] = [
  { title: 'ID', key: 'id' },
  { title: 'First name', key: 'firstName' },
  { title: 'Last name', key: 'lastName' },
  { title: 'Email', key: 'email' },
  { title: 'Status', key: 'status' },
]

function normalize(payload: unknown): Candidate[] {
  return extractCollectionFromPayload(payload).map((entry, index) => {
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
} = useAdminResourcePage<Candidate, Record<string, string>>({
  initialFilters: { status: '' },
  normalize,
  loadRows: async ({ search, filters, page, pageSize }) => {
    const payload = await $fetch('/api/candidates', {
      query: { search: search || undefined, status: filters.status || undefined, page, limit: pageSize },
    })

    return { payload }
  },
})

function createRow() {
  Notify.info(String(useNuxtApp().$i18n.t('notifications.ui.todoCandidateCreate')))
}

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
