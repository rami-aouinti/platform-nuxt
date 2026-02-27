<script setup lang="ts">
import type { DataTableHeader } from 'vuetify'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import { Notify } from '~/stores/notification'
import { useApiKeysStore } from '~/stores/apiKeys'
import { canManageApiKeys } from '~/utils/permissions/admin'

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
const apiKeysStore = useApiKeysStore()

const { roles } = storeToRefs(authStore)
const { rows, loading, error, search, pagination } = storeToRefs(apiKeysStore)

const page = computed({
  get: () => pagination.value.page,
  set: (value: number) => apiKeysStore.setPage(value),
})

const pageSize = computed({
  get: () => pagination.value.perPage,
  set: (value: number) => apiKeysStore.setPerPage(value),
})

const total = computed(() => pagination.value.total)
const filters = ref<Record<string, string>>({})

const isRoot = computed(() => canManageApiKeys(roles.value))

const columns: DataTableHeader[] = [
  { title: 'ID', key: 'id' },
  { title: 'Token', key: 'token' },
  { title: 'Description', key: 'description' },
]

function createRow() {
  Notify.info('Utilisez la vue de gestion API Keys pour exécuter le CRUD complet.')
}

watch([page, pageSize], () => {
  void apiKeysStore.refreshInventory()
})

watchDebounced(search, (value) => {
  apiKeysStore.setSearch(value)
  void apiKeysStore.refreshInventory()
}, { debounce: 300, maxWait: 1000 })

onMounted(async () => {
  await authStore.ensureRolesLoaded()
  await apiKeysStore.refreshInventory()
})
</script>

<template>
  <AdminResourcePage
    title="API Keys"
    description="Gestion des clés API (list/count/ids + CRUD), avec fallback automatique v2 → v1 si v2 n'est pas disponible."
    :columns="columns"
    :rows="rows"
    :loading="loading"
    :error="error"
    :total="total"
    :page="page"
    :page-size="pageSize"
    :search="search"
    :filters="filters"
    :detail-fields="[
      { key: 'id', label: 'ID' },
      { key: 'token', label: 'Token' },
      { key: 'description', label: 'Description' },
    ]"
    :editable-fields="[
      { key: 'token', label: 'Token' },
      { key: 'description', label: 'Description' },
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
    @refresh="apiKeysStore.refreshInventory"
  />
</template>
