<script setup lang="ts">
import type { DataTableHeader } from 'vuetify'
import { storeToRefs } from 'pinia'
import { Notify } from '~/stores/notification'
import { useAuthStore } from '~/stores/auth'
import { apiKeysV1Service } from '../../../services/admin/api-keys/v1'
import { apiKeysV2Service } from '../../../services/admin/api-keys/v2'
import { canManageApiKeys } from '~/utils/permissions/admin'

type ApiKeyRecord = { id: string; name: string; prefix: string; createdAt: string; status: string }

definePageMeta({
  icon: 'mdi-key-variant',
  title: 'Api keys',
  drawerIndex: 74,
  requiresAuth: true,
  requiresAdmin: true,
  layout: 'administration',
  middleware: ['auth', 'admin-access'],
  adminPermission: 'manageApiKeys',
})

const authStore = useAuthStore()
const { roles } = storeToRefs(authStore)

const rows = ref<ApiKeyRecord[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const search = ref('')
const filters = ref<Record<string, string>>({ status: '' })

const apiKeysService = apiKeysV2Service

type ApiKeysService = typeof apiKeysV2Service | typeof apiKeysV1Service

const isRoot = computed(() => canManageApiKeys(roles.value))

const columns: DataTableHeader[] = [
  { title: 'ID', key: 'id' },
  { title: 'Nom', key: 'name' },
  { title: 'Prefix', key: 'prefix' },
  { title: 'Créé le', key: 'createdAt' },
  { title: 'Status', key: 'status' },
]

function normalize(payload: unknown): ApiKeyRecord[] {
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
      name: String(row.label ?? row.name ?? ''),
      prefix: String(row.keyPrefix ?? row.tokenPrefix ?? row.prefix ?? ''),
      createdAt: String(row.createdAt ?? row.created_at ?? ''),
      status: String(row.enabled === false ? 'disabled' : row.status ?? 'active'),
    }
  })
}

function toError(errorValue: unknown) {
  if (errorValue instanceof Error) {
    return errorValue.message
  }

  return 'Erreur API.'
}

async function loadWithFallback<T>(run: (service: ApiKeysService) => Promise<T>) {
  try {
    return await run(apiKeysService)
  } catch (errorValue) {
    if (isError(errorValue) && errorValue.statusCode === 404) {
      return run(apiKeysV1Service)
    }

    throw errorValue
  }
}

async function loadRows() {
  loading.value = true
  error.value = null
  try {
    const listQuery = {
      page: page.value,
      pageSize: pageSize.value,
      search: search.value || undefined,
      filters: {
        status: filters.value.status || undefined,
      },
    }

    const [listResponse, countResponse, idsResponse] = await Promise.all([
      loadWithFallback((service) => service.list(listQuery)),
      loadWithFallback<{ count: number }>((service) => service.count()),
      loadWithFallback<string[]>((service) => service.ids()),
    ])

    rows.value = normalize(listResponse)
    total.value = Number(countResponse.count ?? idsResponse.length ?? rows.value.length)
  } catch (errorValue) {
    error.value = toError(errorValue)
  } finally {
    loading.value = false
  }
}

function createRow() {
  Notify.info('TODO: brancher la génération d’API key.')
}

watch([page, pageSize], loadRows)
watchDebounced([search, filters], loadRows, { debounce: 300, maxWait: 1000 })

onMounted(async () => {
  await authStore.ensureRolesLoaded()
  await loadRows()
})
</script>

<template>
  <AdminResourcePage
    title="API Keys"
    description="Prototype API keys avec droits ROLE_ROOT et hooks CRUD prêts pour services backend."
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
      { key: 'name', label: 'Nom' },
      { key: 'prefix', label: 'Prefix' },
      { key: 'createdAt', label: 'Créé le' },
      { key: 'status', label: 'Status' },
    ]"
    :editable-fields="[
      { key: 'name', label: 'Nom' },
      { key: 'status', label: 'Status' },
    ]"
    :can-show="isRoot"
    :can-create="isRoot"
    :can-edit="isRoot"
    :can-delete="isRoot"
    resource-name="la clé API"
    create-label="Créer une clé"
    @update:page="page = $event"
    @update:page-size="pageSize = $event"
    @update:search="search = $event"
    @update:filters="filters = $event"
    @create="createRow"
    @refresh="loadRows"
  />
</template>
