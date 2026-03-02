<script setup lang="ts">
import type { DataTableHeader } from 'vuetify'
import { storeToRefs } from 'pinia'
import { Notify } from '~/stores/notification'
import { useAuthStore } from '~/stores/auth'
import { canManageUsers } from '~/utils/permissions/admin'
import { extractCollectionFromPayload } from '~/utils/admin/extractCollectionFromPayload'
import type { AdminResourceSchema } from '~/types/admin-schema'
import { getAdminResourceDescriptor } from '~/services/admin/resource-descriptors'
import { buildSchemaColumns, buildSchemaFieldConfigs, normalizeAdminSchema } from '~/utils/admin/schema'

type RoleRecord = { id: string; [key: string]: unknown }

definePageMeta({
  icon: 'mdi-shield-account-outline',
  title: 'Roles',
  subtitle: 'Roles Management Administration',
  drawerIndex: 73,
  requiresAuth: true,
  requiresAdmin: true,
  layout: 'administration',
  middleware: ['auth', 'admin-access'],
  adminPermission: 'manageUsers',
})

const authStore = useAuthStore()
const { roles } = storeToRefs(authStore)
const rolesDescriptor = getAdminResourceDescriptor('roles')
const canShow = computed(() => canManageUsers(roles.value))
const canMutate = computed(() => false)

const createOpen = ref(false)
const creating = ref(false)
const createForm = reactive({
  name: '',
  description: '',
})

const fallbackColumns: DataTableHeader[] = [
  { title: 'Nom', key: 'name' },
  { title: 'Description', key: 'description' },
]

const fallbackFields = [
  { key: 'name', label: 'Nom' },
  { key: 'description', label: 'Description' },
]

const roleSchema = ref<AdminResourceSchema | null>(null)

const columns = computed<DataTableHeader[]>(() => buildSchemaColumns(roleSchema.value, fallbackColumns))
const detailFields = computed(() => buildSchemaFieldConfigs(roleSchema.value?.editable, fallbackFields))

function normalize(payload: unknown): RoleRecord[] {
  return extractCollectionFromPayload(payload).map((entry, index) => {
    const row = entry as Record<string, unknown>
    return {
      ...row,
      id: String(row.id ?? row.uuid ?? index),
    }
  })
}

async function loadSchema() {
  if (!rolesDescriptor.schemaEndpoint) {
    roleSchema.value = null
    return
  }

  try {
    const payload = await $fetch(String(rolesDescriptor.schemaEndpoint))
    roleSchema.value = normalizeAdminSchema(payload)
  } catch {
    roleSchema.value = null
  }
}

const {
  rows,
  loading,
  error,
  total,
  page,
  pageSize,
  sortBy,
  search,
  filters,
  mutationLoading,
  loadRows,
  saveEdit,
  deleteRow,
} = useAdminResourcePage<RoleRecord, Record<string, string>>({
  initialFilters: {},
  normalize,
  loadRows: async ({ page, pageSize, sortBy, search }) => {
    const activeSort = sortBy[0]
    const order = activeSort && activeSort.order
      ? `${activeSort.key}:${activeSort.order === 'desc' ? 'desc' : 'asc'}`
      : undefined

    const [payload, countPayload] = await Promise.all([
      $fetch('/api/v1/admin/roles', {
        query: {
          search: search || undefined,
          limit: pageSize,
          offset: Math.max(page - 1, 0) * pageSize,
          order,
        },
      }),
      $fetch('/api/v1/admin/roles/count'),
    ])

    return { payload, countPayload }
  },
  saveEdit: async (row) => {
    await $fetch(`/api/v1/admin/roles/${encodeURIComponent(String(row.id ?? ''))}`, {
      method: 'PATCH' as any,
      body: {
        name: String(row.name ?? '').trim(),
        description: String(row.description ?? '').trim() || undefined,
      },
    })

    Notify.success('Rôle mis à jour.')
    await loadRows()
  },
  deleteRow: async (row) => {
    await $fetch(`/api/v1/admin/roles/${encodeURIComponent(String(row.id ?? ''))}`, {
      method: 'DELETE' as any,
    })

    Notify.success('Rôle supprimé.')
    await loadRows()
  },
})

function createRow() {
  if (!canMutate.value) {
    return
  }

  createForm.name = ''
  createForm.description = ''
  createOpen.value = true
}

async function submitCreateRole() {
  if (!createForm.name.trim()) {
    Notify.error('Le nom du rôle est requis.')
    return
  }

  creating.value = true

  try {
    await $fetch('/api/v1/admin/roles', {
      method: 'POST' as any,
      body: {
        name: createForm.name.trim(),
        description: createForm.description.trim() || undefined,
      },
    })

    Notify.success('Rôle créé.')
    createOpen.value = false
    await loadRows()
  } catch (errorValue) {
    Notify.error(errorValue instanceof Error ? errorValue.message : 'Erreur API.')
  } finally {
    creating.value = false
  }
}

onMounted(async () => {
  await authStore.ensureRolesLoaded()
  await loadSchema()
  await loadRows()
})
</script>

<template>
  <div>
    <AdminResourcePage
      :columns="columns"
      :rows="rows"
      :loading="loading"
      :error="error"
      :total="total"
      :page="page"
      :page-size="pageSize"
      :sort-by="sortBy"
      :search="search"
      :filters="filters"
      :detail-fields="detailFields"
      :editable-fields="detailFields"
      :can-show="canShow"
      :can-create="false"
      :can-edit="false"
      :can-delete="false"
      :mutation-loading="mutationLoading"
      resource-name="le rôle"
      @update:page="page = $event"
      @update:page-size="pageSize = $event"
      @update:sort-by="sortBy = $event"
      @update:search="search = $event"
      @update:filters="filters = $event"
      @create="createRow"
      @save-edit="saveEdit"
      @row-delete="deleteRow"
      @refresh="loadRows"
    />

    <v-dialog v-model="createOpen" max-width="640">
      <v-card>
        <v-card-title>Créer un rôle</v-card-title>
        <v-card-text>
          <v-text-field v-model="createForm.name" label="Nom*" class="mb-2" />
          <v-textarea v-model="createForm.description" label="Description" rows="3" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" :disabled="creating" @click="createOpen = false">Annuler</v-btn>
          <v-btn color="primary" :loading="creating" :disabled="creating" @click="submitCreateRole">Créer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
