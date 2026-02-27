<script setup lang="ts">
import type { DataTableHeader } from 'vuetify'
import { storeToRefs } from 'pinia'
import { Notify } from '~/stores/notification'
import { useAuthStore } from '~/stores/auth'
import { canManageUsers } from '~/utils/permissions/admin'
import { extractCollectionFromPayload } from '~/utils/admin/extractCollectionFromPayload'

type RoleRecord = { id: string; name: string; description: string }

definePageMeta({
  icon: 'mdi-shield-account-outline',
  title: 'Roles',
  drawerIndex: 73,
  requiresAuth: true,
  requiresAdmin: true,
  layout: 'administration',
  middleware: ['auth', 'admin-access'],
  adminPermission: 'manageUsers',
})

const authStore = useAuthStore()
const { roles } = storeToRefs(authStore)
const canShow = computed(() => canManageUsers(roles.value))

const columns: DataTableHeader[] = [
  { title: 'ID', key: 'id' },
  { title: 'Nom', key: 'name' },
  { title: 'Description', key: 'description' },
]

function normalize(payload: unknown): RoleRecord[] {
  return extractCollectionFromPayload(payload).map((entry, index) => {
    const row = entry as Record<string, unknown>
    return {
      id: String(row.id ?? row.uuid ?? index),
      name: String(row.name ?? row.id ?? ''),
      description: String(row.description ?? ''),
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
} = useAdminResourcePage<RoleRecord, Record<string, string>>({
  initialFilters: {},
  normalize,
  loadRows: async ({ page, pageSize, search }) => {
    const [payload, countPayload] = await Promise.all([
      $fetch('/api/role', { query: { search: search || undefined, page, limit: pageSize } }),
      $fetch('/api/role/count'),
    ])

    return { payload, countPayload }
  },
})

function createRow() {
  Notify.info('TODO: brancher la création de rôle.')
}

onMounted(async () => {
  await authStore.ensureRolesLoaded()
  await loadRows()
})
</script>

<template>
  <AdminResourcePage
    title="Roles"
    description="Prototype prêt pour brancher le cycle liste/détail/édition/suppression des rôles."
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
      { key: 'name', label: 'Nom' },
      { key: 'description', label: 'Description' },
    ]"
    :editable-fields="[
      { key: 'name', label: 'Nom' },
      { key: 'description', label: 'Description' },
    ]"
    :can-show="canShow"
    :can-create="canShow"
    :can-edit="canShow"
    :can-delete="canShow"
    resource-name="le rôle"
    create-label="Créer un rôle"
    @update:page="page = $event"
    @update:page-size="pageSize = $event"
    @update:search="search = $event"
    @update:filters="filters = $event"
    @create="createRow"
    @refresh="loadRows"
  />
</template>
