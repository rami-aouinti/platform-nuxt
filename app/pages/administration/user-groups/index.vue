<script setup lang="ts">
import type { DataTableHeader } from 'vuetify'
import { storeToRefs } from 'pinia'
import { Notify } from '~/stores/notification'
import { useAuthStore } from '~/stores/auth'
import { canManageUsers, isRoot } from '~/utils/permissions/admin'

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

const rows = ref<GroupRecord[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const search = ref('')
const filters = ref<Record<string, string>>({})

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
      description: String(row.description ?? ''),
    }
  })
}

async function loadRows() {
  loading.value = true
  error.value = null
  try {
    const [listResponse, countResponse] = await Promise.all([
      $fetch('/api/group', { query: { page: page.value, limit: pageSize.value, search: search.value || undefined } }),
      $fetch('/api/group/count'),
    ])

    rows.value = normalize(listResponse)
    total.value = typeof countResponse === 'number' ? countResponse : Number((countResponse as { count?: number })?.count ?? rows.value.length)
  } catch (errorValue) {
    error.value = errorValue instanceof Error ? errorValue.message : 'Erreur API.'
  } finally {
    loading.value = false
  }
}

function createRow() {
  Notify.info('TODO: brancher la création de groupe utilisateur.')
}

async function saveEdit(row: Record<string, unknown>) {
  await $fetch(`/api/group/${encodeURIComponent(String(row.id ?? ''))}` as any, {
    method: 'PATCH' as any,
    body: { name: row.name, description: row.description },
  })
  Notify.success('Groupe mis à jour.')
  await loadRows()
}

async function deleteRow(row: Record<string, unknown>) {
  await $fetch(`/api/group/${encodeURIComponent(String(row.id ?? ''))}` as any, {
    method: 'DELETE' as any,
  })
  Notify.success('Groupe supprimé.')
  await loadRows()
}

watch([page, pageSize], loadRows)
watchDebounced(search, loadRows, { debounce: 300, maxWait: 1000 })

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
    resource-name="le groupe"
    create-label="Créer un groupe"
    @update:page="page = $event"
    @update:page-size="pageSize = $event"
    @update:search="search = $event"
    @create="createRow"
    @save-edit="saveEdit"
    @row-delete="deleteRow"
    @refresh="loadRows"
  />
</template>
