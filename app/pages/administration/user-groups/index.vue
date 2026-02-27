<script setup lang="ts">
import type { DataTableHeader } from 'vuetify'
import { storeToRefs } from 'pinia'
import { Notify } from '~/stores/notification'
import { useAuthStore } from '~/stores/auth'
import { canManageUsers, isRoot } from '~/utils/permissions/admin'
import { useInternalEventTracking } from '~/composables/useInternalEventTracking'
import { extractCollectionFromPayload } from '~/utils/admin/extractCollectionFromPayload'

type GroupRecord = { id: string; name: string }

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

const createOpen = ref(false)
const creating = ref(false)
const createForm = reactive({
  name: '',
})

const columns: DataTableHeader[] = [
  { title: 'Nom', key: 'name' },
]

function normalize(payload: unknown): GroupRecord[] {
  return extractCollectionFromPayload(payload).map((entry, index) => {
    const row = entry as Record<string, unknown>
    return {
      id: String(row.id ?? row.uuid ?? index),
      name: String(row.name ?? ''),
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
  sortBy,
  search,
  filters,
  mutationLoading,
  loadRows,
  saveEdit,
  deleteRow,
} = useAdminResourcePage<GroupRecord, Record<string, string>>({
  initialFilters: {},
  normalize,
  loadRows: async ({ page, pageSize, sortBy, search }) => {
    const [payload, countPayload] = await Promise.all([
      $fetch('/api/user_group', {
        query: {
          limit: pageSize,
          offset: Math.max(page - 1, 0) * pageSize,
          order: sortBy[0] && sortBy[0].order && sortBy[0].order !== false
            ? `${sortBy[0].key}:${sortBy[0].order === 'desc' ? 'desc' : 'asc'}`
            : undefined,
          search: search || undefined,
        },
      }),
      $fetch('/api/user_group/count'),
      $fetch('/api/user_group/ids'),
    ])

    return { payload, countPayload }
  },
  saveEdit: async (row) => {
    try {
      await $fetch(
        `/api/user_group/${encodeURIComponent(String(row.id ?? ''))}` as any,
        {
          method: 'PATCH' as any,
          body: { name: row.name },
        },
      )
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
      Notify.error(
        `Action échouée : ${errorValue instanceof Error ? errorValue.message : 'Erreur API.'}`,
      )
    }
  },
  deleteRow: async (row) => {
    try {
      await $fetch(
        `/api/user_group/${encodeURIComponent(String(row.id ?? ''))}` as any,
        {
          method: 'DELETE' as any,
        },
      )
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
      Notify.error(
        `Action échouée : ${errorValue instanceof Error ? errorValue.message : 'Erreur API.'}`,
      )
    }
  },
})

function createRow() {
  if (!canCreate.value) {
    return
  }

  createForm.name = ''
  createOpen.value = true
}

async function submitCreateRow() {
  if (!createForm.name.trim()) {
    Notify.error('Le nom du groupe est requis.')
    return
  }

  creating.value = true

  try {
    await $fetch('/api/user_group', {
      method: 'POST' as any,
      body: {
        name: createForm.name.trim(),
      },
    })

    Notify.success('Action réussie : groupe créé.')
    track({
      name: 'admin.user-groups.create',
      payload: { name: createForm.name.trim() },
    })
    createOpen.value = false
    await loadRows()
  } catch (errorValue) {
    Notify.error(
      `Action échouée : ${errorValue instanceof Error ? errorValue.message : 'Erreur API.'}`,
    )
  } finally {
    creating.value = false
  }
}

onMounted(async () => {
  await authStore.ensureRolesLoaded()
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
      :detail-fields="[{ key: 'name', label: 'Nom' }]"
      :editable-fields="[{ key: 'name', label: 'Nom' }]"
      :can-show="canShow"
      :can-create="canCreate"
      :can-edit="canEdit"
      :can-delete="canDelete"
      :mutation-loading="mutationLoading"
      resource-name="le groupe"
      detail-route-base="/administration/user-groups"
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
        <v-card-title>Créer un groupe</v-card-title>
        <v-card-text>
          <v-text-field v-model="createForm.name" label="Nom*" class="mb-2" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" :disabled="creating" @click="createOpen = false"
            >Annuler</v-btn
          >
          <v-btn
            color="primary"
            :loading="creating"
            :disabled="creating"
            @click="submitCreateRow"
          >
            Créer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
