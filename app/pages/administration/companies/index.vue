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
  { title: 'Status', key: 'status' },
  { title: 'Address', key: 'mainAddressText' },
  { title: 'Owner', key: 'ownerName' },
]


function createPayloadFromDraft(): CreateCompanyRequest {
  const stamp = Date.now().toString()

  return {
    legalName: `Nouvelle société ${stamp.slice(-4)}`,
    status: 'active',
    mainAddress: [],
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

    return {
      payload: response.data.map((item) => ({
        ...item,
        mainAddressText: Array.isArray(item.mainAddress) ? item.mainAddress.join(', ') : '',
        ownerName: item.owner && typeof item.owner === 'object'
          ? [item.owner.firstName, item.owner.lastName].filter(Boolean).join(' ').trim() || String(item.owner.username ?? item.owner.id ?? '')
          : '',
      })),
      total: response.meta?.totalItems ?? response.data.length,
    }
  },
})

async function createRow() {
  if (mutationLoading.value) {
    return
  }

  mutationLoading.value = true

  try {
    await companiesService.create(createPayloadFromDraft())
    Notify.success(String(useNuxtApp().$i18n.t('notifications.profileCompanies.created')))
    await loadRows()
  } catch (errorValue) {
    Notify.error(toUiErrorMessage(errorValue))
  } finally {
    mutationLoading.value = false
  }
}

function normalizeCompanyStatus(status: unknown): UpdateCompanyRequest['status'] {
  const normalized = String(status ?? '').toLowerCase()

  if (normalized === 'suspended') {
    return 'suspended'
  }

  if (normalized === 'inactive') {
    return 'inactive'
  }

  return 'active'
}

async function patchCompanyStatus(companyId: string, status: UpdateCompanyRequest['status']) {
  if (!companyId || mutationLoading.value) {
    return
  }

  mutationLoading.value = true

  try {
    await companiesService.patch(companyId, { status })
    Notify.success(String(useNuxtApp().$i18n.t('notifications.ui.companyStatusUpdated')))
    await loadRows()
  } catch (errorValue) {
    Notify.error(toUiErrorMessage(errorValue))
  } finally {
    mutationLoading.value = false
  }
}

async function toggleCompanyStatus(row: Record<string, unknown>, value: boolean | null) {
  const id = String(row.id ?? '')
  const currentStatus = normalizeCompanyStatus(row.status)
  const requestedStatus = value ? 'active' : 'suspended'

  if (!id || currentStatus === requestedStatus) {
    return
  }

  await patchCompanyStatus(id, requestedStatus)
}

function isCompanyActive(status: unknown) {
  return normalizeCompanyStatus(status) === 'active'
}

function getStatusLabel(status: unknown) {
  const normalized = normalizeCompanyStatus(status)

  if (normalized === 'suspended') {
    return 'Suspended'
  }

  if (normalized === 'inactive') {
    return 'Inactive'
  }

  return 'Active'
}

async function updateRow(row: Record<string, unknown>) {
  if (mutationLoading.value) {
    return
  }

  mutationLoading.value = true

  try {
    await companiesService.update(String(row.id ?? ''), {
      legalName: String(row.legalName ?? ''),
      status: normalizeCompanyStatus(row.status),
      mainAddress: Array.isArray(row.mainAddress) ? row.mainAddress : [],
    })

    Notify.success(String(useNuxtApp().$i18n.t('notifications.profileCompanies.updated')))
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
    Notify.success(String(useNuxtApp().$i18n.t('notifications.profileCompanies.deleted')))
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
      { key: 'status', label: 'Status' },
      { key: 'mainAddressText', label: 'Address' },
      { key: 'ownerName', label: 'Owner' },
    ]"
    :editable-fields="[
      { key: 'legalName', label: 'Legal name' },
      { key: 'status', label: 'Status' },
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
  >
    <template #cell:status="{ item, value }">
      <div class="d-flex align-center ga-3" @click.stop>
        <v-checkbox-btn
          :model-value="isCompanyActive(value)"
          :disabled="mutationLoading"
          color="primary"
          :aria-label="`Activer la société ${String(item.legalName ?? item.id ?? '')}`"
          @update:model-value="toggleCompanyStatus(item, $event)"
        />
        <span>{{ getStatusLabel(value) }}</span>
      </div>
    </template>
  </AdminResourcePage>
</template>
