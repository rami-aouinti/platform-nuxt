<script setup lang="ts">
import type { DataTableHeader } from 'vuetify'
import { storeToRefs } from 'pinia'
import { Notify } from '~/stores/notification'
import { useAuthStore } from '~/stores/auth'
import { canManageUsers, isRoot } from '~/utils/permissions/admin'
import { useInternalEventTracking } from '~/composables/useInternalEventTracking'
import { extractCollectionFromPayload } from '~/utils/admin/extractCollectionFromPayload'

type GroupRecord = { id: string; name: string; description: string }

definePageMeta({
  icon: 'mdi-account-group-outline',
  title: 'User groups',
  drawerIndex: 72,
  requiresAuth: true,
  requiresAdmin: true,
  layout: 'administration',
  middleware: ['auth', 'admin-access'],
  adminPermission: 'manageUsers',
})

const authStore = useAuthStore()
const { roles } = storeToRefs(authStore)
const { track } = useInternalEventTracking()

const canShow = computed(() => canManageUsers(roles.value))
const canCreate = computed(() => isRoot(roles.value))
const canEdit = computed(() => isRoot(roles.value))
const canDelete = computed(() => isRoot(roles.value))

const columns: DataTableHeader[] = [
  { title: 'ID', key: 'id' },
  { title: 'Nom', key: 'name' },
  { title: 'Description', key: 'description' },
]

function normalize(payload: unknown): GroupRecord[] {
  return extractCollectionFromPayload(payload).map((entry, index) => {
    const row = entry as Record<string, unknown>
    return {
      id: String(row.id ?? row.uuid ?? index),
      name: String(row.name ?? ''),
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
  mutationLoading,
  loadRows,
  saveEdit,
  deleteRow,
} = useAdminResourcePage<GroupRecord, Record<string, string>>({
  initialFilters: {},
  normalize,
  loadRows: async ({ page, pageSize, search }) => {
    const [payload, countPayload] = await Promise.all([
      $fetch('/api/user_group', { query: { page, limit: pageSize, search: search || undefined } }),
      $fetch('/api/user_group/count'),
      $fetch('/api/user_group/ids'),
    ])

    return { payload, countPayload }
  },
  saveEdit: async (row) => {
    try {
      await $fetch(`/api/user_group/${encodeURIComponent(String(row.id ?? ''))}` as any, {
        method: 'PATCH' as any,
        body: { name: row.name, description: row.description },
      })
      Notify.success('Action réussie : groupe mis à jour.')
      track({
        name: 'admin.user-groups.patch',
        payload: {
          id: String(row.id ?? ''),
          name: String(row.name ?? ''),
        },
      })
      await loadRows()
    } catch (errorValue) {
      Notify.error(`Action échouée : ${errorValue instanceof Error ? errorValue.message : 'Erreur API.'}`)
    }
  },
  deleteRow: async (row) => {
    try {
      await $fetch(`/api/user_group/${encodeURIComponent(String(row.id ?? ''))}` as any, {
        method: 'DELETE' as any,
      })
      Notify.success('Action réussie : groupe supprimé.')
      track({
        name: 'admin.user-groups.delete',
        payload: {
          id: String(row.id ?? ''),
          name: String(row.name ?? ''),
        },
      })
      await loadRows()
    } catch (errorValue) {
      Notify.error(`Action échouée : ${errorValue instanceof Error ? errorValue.message : 'Erreur API.'}`)
    }
  },
})

async function createRow() {
  const suffix = Date.now().toString().slice(-6)

  try {
    await $fetch('/api/user_group', {
      method: 'POST' as any,
      body: {
        name: `group_${suffix}`,
        description: "Groupe créé depuis l'administration",
      },
    })

    Notify.success('Action réussie : groupe créé.')
    track({
      name: 'admin.user-groups.create',
      payload: { name: `group_${suffix}` },
    })
    await loadRows()
  } catch (errorValue) {
    Notify.error(`Action échouée : ${errorValue instanceof Error ? errorValue.message : 'Erreur API.'}`)
  }
}

onMounted(async () => {
  await authStore.ensureRolesLoaded()
  await loadRows()
})
</script>

<template>
  <AdminResourcePage
    title="User Groups"
    description="Même pattern que Users pour brancher rapidement le CRUD groupes."
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
    :can-create="canCreate"
    :can-edit="canEdit"
    :can-delete="canDelete"
    :mutation-loading="mutationLoading"
    resource-name="le groupe"
    create-label="Créer un groupe"
    @update:page="page = $event"
    @update:page-size="pageSize = $event"
    @update:search="search = $event"
    @update:filters="filters = $event"
    @create="createRow"
    @save-edit="saveEdit"
    @row-delete="deleteRow"
    @refresh="loadRows"
  />
</template>
