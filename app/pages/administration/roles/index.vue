<script setup lang="ts">
import type { DataTableHeader } from 'vuetify'
import { storeToRefs } from 'pinia'
import { Notify } from '~/stores/notification'
import { useAuthStore } from '~/stores/auth'
import { isAdmin } from '~/utils/permissions/admin'
import { normalizeListResponse } from '~/utils/admin/normalize-list-response'

type RoleRecord = { id: string; name: string; description: string }

definePageMeta({
  icon: 'mdi-shield-account-outline',
  title: 'Roles',
  drawerIndex: 73,
  requiresAuth: true,
  requiresAdmin: true,
  layout: 'administration',
  middleware: ['auth', 'admin-access'],
})

const authStore = useAuthStore()
const { roles } = storeToRefs(authStore)

const rows = ref<RoleRecord[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const search = ref('')
const filters = ref<Record<string, string>>({})

const canShow = computed(() => isAdmin(roles.value))

const columns: DataTableHeader[] = [
  { title: 'ID', key: 'id' },
  { title: 'Nom', key: 'name' },
  { title: 'Description', key: 'description' },
]

function toRoles(list: unknown[]): RoleRecord[] {
  return list.map((entry, index) => {
    const row = entry as Record<string, unknown>
    return {
      id: String(row.id ?? row.uuid ?? index),
      name: String(row.name ?? row.id ?? ''),
      description: String(row.description ?? ''),
    }
  })
}

async function loadRows() {
  loading.value = true
  error.value = null

  try {
    const listResponse = await $fetch('/api/role', {
      query: { search: search.value || undefined, page: page.value, limit: pageSize.value },
    })

    const normalized = normalizeListResponse(listResponse)
    rows.value = toRoles(normalized.rows)
    total.value = normalized.total ?? rows.value.length
  } catch (errorValue) {
    error.value = errorValue instanceof Error ? errorValue.message : 'Erreur API.'
  } finally {
    loading.value = false
  }
}

function createRow() {
  Notify.info('TODO: brancher la création de rôle.')
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
    @create="createRow"
    @refresh="loadRows"
  />
</template>
