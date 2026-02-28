<script setup lang="ts">
import type { DataTableHeader } from 'vuetify'
import { storeToRefs } from 'pinia'
import { Notify } from '~/stores/notification'
import { useAuthStore } from '~/stores/auth'
import { canManageUsers, isRoot } from '~/utils/permissions/admin'
import { useInternalEventTracking } from '~/composables/useInternalEventTracking'
import { extractCollectionFromPayload } from '~/utils/admin/extractCollectionFromPayload'
import { useRelationField } from '~/composables/admin/useRelationField'
import type { AdminResourceSchema } from '~/types/admin-schema'
import { getAdminResourceDescriptor } from '~/services/admin/resource-descriptors'
import { buildSchemaColumns, buildSchemaFieldConfigs, normalizeAdminSchema } from '~/utils/admin/schema'

type GroupRecord = { id: string; name: string }
type UserRecord = {
  id: string
  username: string
  firstName: string
  lastName: string
  email: string
}

definePageMeta({
  icon: 'mdi-account-group-outline',
  title: 'User groups',
  subtitle: 'User groups Management Administration',
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
const groupsDescriptor = getAdminResourceDescriptor('groups')

const canShow = computed(() => canManageUsers(roles.value))
const canEdit = computed(() => isRoot(roles.value))
const canDelete = computed(() => isRoot(roles.value))
const canManageUsersInGroup = computed(() => isRoot(roles.value))

const createOpen = ref(false)
const creating = ref(false)
const createForm = reactive({
  name: '',
})

const detailLoading = ref(false)
const detailActionLoading = ref(false)
const selectedDetailGroup = ref<GroupRecord | null>(null)
const selectedUserId = ref('')

const groupUsersRelation = useRelationField<UserRecord>({
  fieldName: 'users',
  fieldEndpoint: '/api/user',
  parentEndpoint: '/api/user_group',
  relationEndpoint: relationId => `/api/user_group/${encodeURIComponent(String(selectedDetailGroup.value?.id ?? ''))}/user/${encodeURIComponent(relationId)}`,
  optionsQuery: {
    limit: 300,
    offset: 0,
  },
  mapItem: (entry) => {
    if (!entry || typeof entry !== 'object') {
      return null
    }

    const row = entry as Record<string, unknown>
    const id = String(row.id ?? row.uuid ?? '').trim()

    if (!id) {
      return null
    }

    return {
      id,
      username: String(row.username ?? row.userName ?? '').trim(),
      firstName: String(row.firstName ?? '').trim(),
      lastName: String(row.lastName ?? '').trim(),
      email: String(row.email ?? '').trim(),
    }
  },
  getId: item => item.id,
  getLabel: item => item.username || item.email || item.id,
})

const detailUsers = groupUsersRelation.relationItems
const userOptionsLoading = computed(() => groupUsersRelation.loadingOptions.value)

const fallbackColumns: DataTableHeader[] = [
  { title: 'Nom', key: 'name' },
]

const fallbackFields = [{ key: 'name', label: 'Nom' }]
const groupSchema = ref<AdminResourceSchema | null>(null)

const columns = computed<DataTableHeader[]>(() => buildSchemaColumns(groupSchema.value, fallbackColumns))
const detailFields = computed(() => buildSchemaFieldConfigs(groupSchema.value?.editable, fallbackFields))

function normalize(payload: unknown): GroupRecord[] {
  return extractCollectionFromPayload(payload).map((entry, index) => {
    const row = entry as Record<string, unknown>
    return {
      id: String(row.id ?? row.uuid ?? index),
      name: String(row.name ?? ''),
    }
  })
}


async function loadSchema() {
  if (!groupsDescriptor.schemaEndpoint) {
    groupSchema.value = null
    return
  }

  try {
    const payload = await $fetch(String(groupsDescriptor.schemaEndpoint))
    groupSchema.value = normalizeAdminSchema(payload)
  } catch {
    groupSchema.value = null
  }
}

const availableUserOptions = computed(() => {
  return groupUsersRelation.availableOptions.value.map(option => ({
    title: option.label,
    value: option.id,
  }))
})

async function loadAvailableUsers() {
  try {
    await groupUsersRelation.loadOptions()
  } catch (errorValue) {
    Notify.error(
      `Impossible de charger les utilisateurs : ${errorValue instanceof Error ? errorValue.message : 'Erreur API.'}`,
    )
  }
}

async function loadGroupUsers(groupId: string) {
  if (!groupId) {
    return
  }

  detailLoading.value = true

  try {
    const payload = await $fetch(`/api/user_group/${encodeURIComponent(groupId)}/users`)
    detailUsers.value = groupUsersRelation.normalizeItems(payload)
  } catch (errorValue) {
    Notify.error(
      `Impossible de charger les membres du groupe : ${errorValue instanceof Error ? errorValue.message : 'Erreur API.'}`,
    )
    detailUsers.value = []
  } finally {
    detailLoading.value = false
  }
}

async function onRowShow(row: Record<string, unknown>) {
  selectedDetailGroup.value = row as GroupRecord
  selectedUserId.value = ''
  detailUsers.value = []
  await loadGroupUsers(String(row.id ?? ''))
}

async function attachUser() {
  if (!canManageUsersInGroup.value || !selectedDetailGroup.value || !selectedUserId.value) {
    return
  }

  detailActionLoading.value = true

  try {
    await groupUsersRelation.addRelation(selectedUserId.value)
    Notify.success('Utilisateur attaché avec succès.')
    selectedUserId.value = ''
    await loadGroupUsers(selectedDetailGroup.value.id)
  } catch (errorValue) {
    Notify.error(
      `Impossible d'attacher l'utilisateur : ${errorValue instanceof Error ? errorValue.message : 'Erreur API.'}`,
    )
  } finally {
    detailActionLoading.value = false
  }
}


function createRow() {
  if (!canEdit.value) {
    return
  }

  createForm.name = ''
  createOpen.value = true
}

function formatUserTitle(user: UserRecord): string {
  const fullName = `${user.firstName} ${user.lastName}`.trim()

  if (fullName && user.username) {
    return `${fullName} (${user.username})`
  }

  if (fullName) {
    return fullName
  }

  return user.username || user.id
}

async function submitCreateGroup() {
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

    Notify.success('Groupe créé.')
    createOpen.value = false
    await loadRows()
  } catch (errorValue) {
    Notify.error(errorValue instanceof Error ? errorValue.message : 'Erreur API.')
  } finally {
    creating.value = false
  }
}

async function detachUser(userId: string) {
  if (!canManageUsersInGroup.value || !selectedDetailGroup.value) {
    return
  }

  detailActionLoading.value = true

  try {
    await groupUsersRelation.removeRelation(userId)
    Notify.success('Utilisateur retiré du groupe.')
    await loadGroupUsers(selectedDetailGroup.value.id)
  } catch (errorValue) {
    Notify.error(
      `Impossible de retirer l'utilisateur : ${errorValue instanceof Error ? errorValue.message : 'Erreur API.'}`,
    )
  } finally {
    detailActionLoading.value = false
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
} = useAdminResourcePage<GroupRecord, Record<string, string>>({
  initialFilters: {},
  normalize,
  loadRows: async ({ page, pageSize, sortBy, search }) => {
    const [payload, countPayload] = await Promise.all([
      $fetch('/api/user_group', {
        query: {
          limit: pageSize,
          offset: Math.max(page - 1, 0) * pageSize,
          order: sortBy[0] && sortBy[0].order
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

onMounted(async () => {
  await authStore.ensureRolesLoaded()
  await loadSchema()
  await Promise.all([loadRows(), loadAvailableUsers()])
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
      :can-create="canEdit"
      :can-edit="canEdit"
      :can-delete="canDelete"
      :mutation-loading="mutationLoading"
      resource-name="le groupe"
      @update:page="page = $event"
      @update:page-size="pageSize = $event"
      @update:sort-by="sortBy = $event"
      @update:search="search = $event"
      @update:filters="filters = $event"
      @row-show="onRowShow"
      @create="createRow"
      @save-edit="saveEdit"
      @row-delete="deleteRow"
      @refresh="loadRows"
    >
      <template #detail-content>
        <div v-if="selectedDetailGroup">
          <div class="text-subtitle-1 mb-2">Utilisateurs du groupe {{ selectedDetailGroup.name }}</div>

          <v-progress-linear v-if="detailLoading" indeterminate color="primary" class="my-3" />

          <div v-if="detailUsers.length === 0" class="text-medium-emphasis mb-3">Aucun utilisateur attaché.</div>

          <v-list v-else density="comfortable" lines="one" class="bg-transparent pa-0 mb-3">
            <v-list-item v-for="user in detailUsers" :key="user.id" class="px-0">
              <v-list-item-title>{{ formatUserTitle(user) }}</v-list-item-title>
              <v-list-item-subtitle>{{ user.email || user.id }}</v-list-item-subtitle>
              <template #prepend>
                <v-btn
                  v-if="canManageUsersInGroup"
                  size="x-small"
                  variant="text"
                  color="error"
                  icon="mdi-close"
                  :disabled="detailActionLoading"
                  @click="detachUser(user.id)"
                />
              </template>
            </v-list-item>
          </v-list>

          <v-row dense>
            <v-col cols="12" md="8">
              <v-select
                v-model="selectedUserId"
                label="Ajouter un utilisateur"
                :items="availableUserOptions"
                item-title="title"
                item-value="value"
                hide-details
                density="comfortable"
                :loading="userOptionsLoading"
                :disabled="!canManageUsersInGroup || detailActionLoading"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-btn
                block
                color="primary"
                :loading="detailActionLoading"
                :disabled="!canManageUsersInGroup || !selectedUserId"
                @click="attachUser"
              >
                Attacher
              </v-btn>
            </v-col>
          </v-row>
        </div>
      </template>
    </AdminResourcePage>

    <v-dialog v-model="createOpen" max-width="640">
      <v-card>
        <v-card-title>Créer un groupe</v-card-title>
        <v-card-text>
          <v-text-field v-model="createForm.name" label="Nom*" class="mb-2" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" :disabled="creating" @click="createOpen = false">Annuler</v-btn>
          <v-btn color="primary" :loading="creating" :disabled="creating" @click="submitCreateGroup">Créer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </div>
</template>
