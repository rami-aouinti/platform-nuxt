<script setup lang="ts">
import type { DataTableHeader } from 'vuetify'
import { storeToRefs } from 'pinia'
import { Notify } from '~/stores/notification'
import { useAuthStore } from '~/stores/auth'
import { canManageUsers, isRoot } from '~/utils/permissions/admin'
import { useInternalEventTracking } from '~/composables/useInternalEventTracking'
import { extractCollectionFromPayload } from '~/utils/admin/extractCollectionFromPayload'

type UserRecord = {
  id: string
  username: string
  email: string
  roles: string
  userGroups: string
}

definePageMeta({
  icon: 'mdi-account-multiple-outline',
  title: 'Users',
  drawerIndex: 71,
  requiresAuth: true,
  requiresAdmin: true,
  layout: 'administration',
  middleware: ['auth', 'admin-access'],
  adminPermission: 'manageUsers',
})

const authStore = useAuthStore()
const { roles } = storeToRefs(authStore)
const { track } = useInternalEventTracking()

const canCreate = computed(() => isRoot(roles.value))
const canEdit = computed(() => isRoot(roles.value))
const canDelete = computed(() => isRoot(roles.value))
const canShow = computed(() => canManageUsers(roles.value))

const columns: DataTableHeader[] = [
  { title: 'ID', key: 'id' },
  { title: 'Username', key: 'username' },
  { title: 'Email', key: 'email' },
  { title: 'Rôles', key: 'roles' },
  { title: 'Groupes', key: 'userGroups' },
]

function normalize(payload: unknown): UserRecord[] {
  return extractCollectionFromPayload(payload).map((entry, index) => {
    const row = entry as Record<string, unknown>
    const roleList = Array.isArray(row.roles) ? row.roles.map(String) : []
    const groupList = Array.isArray(row.userGroups) ? row.userGroups.map(String) : []

    return {
      id: String(row.id ?? row.uuid ?? index),
      username: String(row.username ?? ''),
      email: String(row.email ?? ''),
      roles: roleList.join(', '),
      userGroups: groupList.join(', '),
    }
  })
}

function buildQuery({ page, pageSize, search, filters }: { page: number; pageSize: number; search: string; filters: Record<string, string> }) {
  return {
    page,
    limit: pageSize,
    search: search || undefined,
    role: filters.role || undefined,
    group: filters.group || undefined,
  }
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
} = useAdminResourcePage<UserRecord, Record<string, string>>({
  initialFilters: { role: '', group: '' },
  normalize,
  buildQuery,
  loadRows: async (ctx) => {
    const query = buildQuery(ctx)
    const [payload, countPayload] = await Promise.all([
      $fetch('/api/user', { query }),
      $fetch('/api/user/count'),
    ])

    return { payload, countPayload }
  },
  saveEdit: async (row) => {
    try {
      await $fetch(`/api/user/${encodeURIComponent(String(row.id ?? ''))}` as any, {
        method: 'PATCH' as any,
        body: {
          username: row.username,
          email: row.email,
        },
      })

      Notify.success('Action réussie : utilisateur mis à jour.')
      track({
        name: 'admin.users.patch',
        payload: {
          id: String(row.id ?? ''),
          username: String(row.username ?? ''),
        },
      })
      await loadRows()
    } catch (errorValue) {
      Notify.error(`Action échouée : ${errorValue instanceof Error ? errorValue.message : 'Erreur API.'}`)
    }
  },
  deleteRow: async (row) => {
    try {
      await $fetch(`/api/user/${encodeURIComponent(String(row.id ?? ''))}` as any, {
        method: 'DELETE' as any,
      })

      Notify.success('Action réussie : utilisateur supprimé.')
      track({
        name: 'admin.users.delete',
        payload: {
          id: String(row.id ?? ''),
          username: String(row.username ?? ''),
        },
      })
      await loadRows()
    } catch (errorValue) {
      Notify.error(`Action échouée : ${errorValue instanceof Error ? errorValue.message : 'Erreur API.'}`)
    }
  },
})

async function createRow() {
  Notify.info('TODO: brancher le flux de création utilisateur.')
}

onMounted(async () => {
  await authStore.ensureRolesLoaded()
  await loadRows()
})
</script>

<template>
  <AdminResourcePage
    title="Users"
    description="Référence CRUD admin (liste/consultation/édition/suppression) pilotée par permissions."
    :columns="columns"
    :rows="rows"
    :loading="loading"
    :error="error"
    :total="total"
    :page="page"
    :page-size="pageSize"
    :search="search"
    :filters="filters"
    :filter-configs="[
      { key: 'role', label: 'Filtre rôle', icon: 'mdi-shield-account-outline' },
      { key: 'group', label: 'Filtre groupe', icon: 'mdi-account-group-outline' },
    ]"
    :detail-fields="[
      { key: 'id', label: 'ID' },
      { key: 'username', label: 'Username' },
      { key: 'email', label: 'Email' },
      { key: 'roles', label: 'Rôles' },
      { key: 'userGroups', label: 'Groupes' },
    ]"
    :editable-fields="[
      { key: 'username', label: 'Username' },
      { key: 'email', label: 'Email' },
    ]"
    :can-show="canShow"
    :can-create="canCreate"
    :can-edit="canEdit"
    :can-delete="canDelete"
    :mutation-loading="mutationLoading"
    resource-name="l'utilisateur"
    create-label="Créer un utilisateur"
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
