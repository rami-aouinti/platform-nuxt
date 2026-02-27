<script setup lang="ts">
import type { DataTableHeader } from 'vuetify'
import { Notify } from '~/stores/notification'
import { companiesService, type Company, type CreateCompanyRequest, type UpdateCompanyRequest } from '../../../../services/admin/companies/index'
import { buildApiPlatformQuery } from '../../../../services/admin/shared/index'
import { toUiErrorMessage } from '~/utils/errors/toUiErrorMessage'

definePageMeta({
  icon: 'mdi-domain',
  title: 'Companies',
  drawerIndex: 74,
  requiresAuth: true,
  requiresAdmin: true,
  layout: 'administration',
  middleware: ['auth', 'admin-access'],
})

const columns: DataTableHeader[] = [
  { title: 'ID', key: 'id' },
  { title: 'Name', key: 'legalName' },
  { title: 'Slug', key: 'slug' },
  { title: 'Status', key: 'status' },
  { title: 'Address', key: 'mainAddress' },
]


function createPayloadFromDraft(): CreateCompanyRequest {
  const stamp = Date.now().toString()

  return {
    legalName: `Nouvelle société ${stamp.slice(-4)}`,
    slug: `nouvelle-societe-${stamp}`,
    status: 'active',
    mainAddress: 'À compléter',
  }
}

const {
  rows,
  loading,
  mutationLoading,
  error,
  total,
  page,
  pageSize,
  search,
  filters,
  loadRows,
} = useAdminResourcePage<Company, Record<string, string>>({
  initialFilters: { status: '' },
  loadRows: async ({ page, pageSize, search, filters }) => {
    const response = await companiesService.list({
      ...buildApiPlatformQuery({
        page,
        pageSize,
        search,
        sortBy: 'legalName',
        sortOrder: 'asc',
        filters: {
          status: filters.status || undefined,
        },
      }),
    })

    return { payload: response.data, total: response.meta?.totalItems ?? response.data.length }
  },
})

async function createRow() {
  if (mutationLoading.value) {
    return
  }

  mutationLoading.value = true

  try {
    await companiesService.create(createPayloadFromDraft())
    Notify.success('Société créée avec succès.')
    await loadRows()
  } catch (errorValue) {
    Notify.error(toUiErrorMessage(errorValue))
  } finally {
    mutationLoading.value = false
  }
}

async function updateRow(row: Record<string, unknown>) {
  if (mutationLoading.value) {
    return
  }

  mutationLoading.value = true

  try {
    await companiesService.update(String(row.id ?? ''), {
      legalName: String(row.legalName ?? ''),
      slug: String(row.slug ?? ''),
      status: (String(row.status ?? 'active') as UpdateCompanyRequest['status']) || 'active',
      mainAddress: String(row.mainAddress ?? ''),
    })

    Notify.success('Société mise à jour.')
    await loadRows()
  } catch (errorValue) {
    Notify.error(toUiErrorMessage(errorValue))
  } finally {
    mutationLoading.value = false
  }
}

async function deleteRow(row: Record<string, unknown>) {
  if (mutationLoading.value) {
    return
  }

  mutationLoading.value = true

  try {
    await companiesService.remove(String(row.id ?? ''))
    Notify.success('Société supprimée.')
    await loadRows()
  } catch (errorValue) {
    Notify.error(toUiErrorMessage(errorValue))
  } finally {
    mutationLoading.value = false
  }
}


onMounted(loadRows)
</script>

<template>
  <AdminResourcePage
    title="Companies"
    description="Gestion des sociétés (liste + CRUD HTTP)."
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
      { key: 'legalName', label: 'Legal name' },
      { key: 'slug', label: 'Slug' },
      { key: 'status', label: 'Status' },
      { key: 'mainAddress', label: 'Address' },
    ]"
    :editable-fields="[
      { key: 'legalName', label: 'Legal name' },
      { key: 'slug', label: 'Slug' },
      { key: 'status', label: 'Status' },
      { key: 'mainAddress', label: 'Address' },
    ]"
    :can-show="true"
    :can-create="true"
    :can-edit="true"
    :can-delete="true"
    :mutation-loading="mutationLoading"
    resource-name="la société"
    create-label="Créer une société"
    @update:page="page = $event"
    @update:page-size="pageSize = $event"
    @update:search="search = $event"
    @update:filters="filters = $event"
    @create="createRow"
    @save-edit="updateRow"
    @row-delete="deleteRow"
    @refresh="loadRows"
  />
</template>
