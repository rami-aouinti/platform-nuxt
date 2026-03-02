<script setup lang="ts">
import type { DataTableHeader } from 'vuetify'
import { storeToRefs } from 'pinia'
import { Notify } from '~/stores/notification'
import { useAuthStore } from '~/stores/auth'
import { canManageUsers, isRoot } from '~/utils/permissions/admin'
import { useInternalEventTracking } from '~/composables/useInternalEventTracking'
import { extractCollectionFromPayload } from '~/utils/admin/extractCollectionFromPayload'
import type { AdminResourceSchema } from '~/types/admin-schema'
import { useRelationField } from '~/composables/admin/useRelationField'
import { getAdminEntityDefinition } from '~/services/admin/resource-descriptors'
import { resolveAdminEndpoint, resolveAdminListEndpoints } from '~/services/admin/entity-resolver'
import { buildSchemaColumns, buildSchemaFieldConfigs, normalizeAdminSchema } from '~/utils/admin/schema'

type UserRecord = {
  id: string
  [key: string]: unknown
}

type UserGroup = {
  id: string
  name: string
}

definePageMeta({
  icon: 'mdi-account-multiple-outline',
  title: 'Users',
  subtitle: 'Users Management Administration',
  drawerIndex: 71,
  requiresAuth: true,
  requiresAdmin: true,
  layout: 'administration',
  middleware: ['auth', 'admin-access'],
  adminPermission: 'manageUsers',
})

const authStore = useAuthStore()
const usersEntityDefinition = getAdminEntityDefinition('users')
const usersDescriptor = usersEntityDefinition.descriptor
const { roles } = storeToRefs(authStore)
const { track } = useInternalEventTracking()

const userSchema = ref<AdminResourceSchema | null>(null)

const canCreate = computed(() => isRoot(roles.value) && userSchema.value?.isCreatable !== false)
const canEdit = computed(() => isRoot(roles.value) && userSchema.value?.isEditable !== false)
const canDelete = computed(() => isRoot(roles.value) && userSchema.value?.isEditable !== false)
const canShow = computed(() => canManageUsers(roles.value))
const canManageGroups = computed(() => isRoot(roles.value))

const createOpen = ref(false)
const creating = ref(false)
const detailRoles = ref<string[]>([])
const detailLoading = ref(false)
const detailActionLoading = ref(false)
const selectedDetailUser = ref<UserRecord | null>(null)
const selectedGroupId = ref('')

const userGroupsRelation = useRelationField<UserGroup>({
  fieldName: 'userGroups',
  fieldEndpoint: '/api/v1/admin/user-groups',
  parentEndpoint: '/api/v1/admin/users',
  relationEndpoint: relationId => `/api/user/${encodeURIComponent(String(selectedDetailUser.value?.id ?? ''))}/group/${encodeURIComponent(relationId)}`,
  optionsQuery: {
    limit: 200,
    offset: 0,
  },
  mapItem: (entry) => {
    if (!entry || typeof entry !== 'object') {
      return null
    }

    const row = entry as Record<string, unknown>
    const id = String(row.id ?? '').trim()
    if (!id) {
      return null
    }

    return {
      id,
      name: String(row.name ?? row.id ?? '').trim(),
    }
  },
  getId: item => item.id,
  getLabel: item => item.name,
})

const detailGroups = userGroupsRelation.relationItems
const groupOptionsLoading = computed(() => userGroupsRelation.loadingOptions.value)
const createForm = reactive({
  username: '',
  email: '',
  firstName: '',
  lastName: '',
  password: '',
})

const fallbackColumns: DataTableHeader[] = [
  { title: 'Username', key: 'username' },
  { title: 'First name', key: 'firstName' },
  { title: 'Last name', key: 'lastName' },
  { title: 'Email', key: 'email' },
]

const fallbackDetailFields = [
  { key: 'username', label: 'Username' },
  { key: 'firstName', label: 'First name' },
  { key: 'lastName', label: 'Last name' },
  { key: 'email', label: 'Email' },
]

const columns = computed<DataTableHeader[]>(() => {
  return buildSchemaColumns(userSchema.value, fallbackColumns)
})

const detailFields = computed(() => {
  return buildSchemaFieldConfigs(userSchema.value?.editable, usersEntityDefinition.detailFields ?? fallbackDetailFields)
})

const editableFields = computed(() => {
  if (userSchema.value?.isEditable === false) {
    return []
  }

  return detailFields.value
})

function normalize(payload: unknown): UserRecord[] {
  return extractCollectionFromPayload(payload).map((entry, index) => {
    const row = entry as Record<string, unknown>
    const normalizedRow: UserRecord = {
      ...row,
      id: String(row.id ?? row.uuid ?? index),
    }

    for (const [key, value] of Object.entries(normalizedRow)) {
      if (value === null || value === undefined) {
        continue
      }

      if (typeof value === 'boolean' || typeof value === 'number') {
        normalizedRow[key] = value
        continue
      }

      if (typeof value === 'object') {
        normalizedRow[key] = JSON.stringify(value)
      } else {
        normalizedRow[key] = String(value)
      }
    }

    return normalizedRow
  })
}

async function loadSchema() {
  try {
    const payload = await $fetch(String(usersEntityDefinition.schemaEndpoint ?? usersDescriptor.schemaEndpoint ?? '/api/v1/admin/users/schema'))
    userSchema.value = normalizeAdminSchema(payload)
  } catch {
    userSchema.value = null
  }
}

function normalizeStringList(payload: unknown): string[] {
  const records = Array.isArray(payload)
    ? payload
    : payload && typeof payload === 'object' && Array.isArray((payload as { items?: unknown[] }).items)
      ? (payload as { items: unknown[] }).items
      : payload && typeof payload === 'object' && Array.isArray((payload as { data?: unknown[] }).data)
        ? (payload as { data: unknown[] }).data
        : []

  return records
    .map((entry) => String(entry ?? '').trim())
    .filter(Boolean)
}

const availableGroupOptions = computed(() => {
  return userGroupsRelation.availableOptions.value.map(option => ({
    title: option.label,
    value: option.id,
  }))
})

async function loadAvailableGroups() {
  try {
    await userGroupsRelation.loadOptions()
  } catch (errorValue) {
    Notify.error(
      `Impossible de charger les groupes disponibles : ${errorValue instanceof Error ? errorValue.message : 'Erreur API.'}`,
    )
  }
}

async function loadUserDetails(userId: string) {
  if (!userId) {
    return
  }

  detailLoading.value = true

  try {
    const [rolesPayload, groupsPayload] = await Promise.all([
      $fetch(resolveAdminEndpoint(usersDescriptor.relationActions?.roles?.list, userId) ?? `/api/user/${encodeURIComponent(userId)}/roles`),
      $fetch(resolveAdminEndpoint(usersDescriptor.relationActions?.groups?.list, userId) ?? `/api/user/${encodeURIComponent(userId)}/groups`),
    ])

    detailRoles.value = normalizeStringList(rolesPayload)
    detailGroups.value = userGroupsRelation.normalizeItems(groupsPayload)
  } catch (errorValue) {
    Notify.error(
      `Impossible de charger les informations utilisateur : ${errorValue instanceof Error ? errorValue.message : 'Erreur API.'}`,
    )
  } finally {
    detailLoading.value = false
  }
}

async function onRowShow(row: Record<string, unknown>) {
  selectedDetailUser.value = row as UserRecord
  selectedGroupId.value = ''
  detailRoles.value = []
  detailGroups.value = []
  await loadUserDetails(String(row.id ?? ''))
}

async function detachGroup(groupId: string) {
  if (!canManageGroups.value || !selectedDetailUser.value) {
    return
  }

  detailActionLoading.value = true
  try {
    await userGroupsRelation.removeRelation(groupId)
    Notify.success(String(useNuxtApp().$i18n.t('notifications.ui.groupDetachedSuccess')))
    await loadUserDetails(selectedDetailUser.value.id)
  } catch (errorValue) {
    Notify.error(
      `Impossible de détacher le groupe : ${errorValue instanceof Error ? errorValue.message : 'Erreur API.'}`,
    )
  } finally {
    detailActionLoading.value = false
  }
}

async function attachGroup() {
  if (!canManageGroups.value || !selectedDetailUser.value || !selectedGroupId.value) {
    return
  }

  detailActionLoading.value = true
  try {
    await userGroupsRelation.addRelation(selectedGroupId.value)
    Notify.success(String(useNuxtApp().$i18n.t('notifications.ui.groupAttachedSuccess')))
    selectedGroupId.value = ''
    await loadUserDetails(selectedDetailUser.value.id)
  } catch (errorValue) {
    Notify.error(
      `Impossible d'attacher le groupe : ${errorValue instanceof Error ? errorValue.message : 'Erreur API.'}`,
    )
  } finally {
    detailActionLoading.value = false
  }
}

function buildQuery({
  page,
  pageSize,
  sortBy,
  search,
}: {
  page: number
  pageSize: number
  sortBy: readonly { key: string; order?: 'asc' | 'desc' | boolean }[]
  search: string
}) {
  const activeSort = sortBy[0]
  const order = activeSort && (activeSort.order === 'asc' || activeSort.order === 'desc')
    ? `${activeSort.key}:${activeSort.order === 'desc' ? 'desc' : 'asc'}`
    : undefined

  return {
    limit: pageSize,
    offset: Math.max(page - 1, 0) * pageSize,
    order,
    search: search || undefined,
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
} = useAdminResourcePage<UserRecord, Record<string, string>>({
  entityDefinition: usersEntityDefinition,
  initialFilters: {},
  normalize,
  buildQuery,
  loadRows: async (ctx) => {
    const query = buildQuery(ctx)
    const { listEndpoint, countEndpoint } = resolveAdminListEndpoints(usersDescriptor.list)
    const [payload, countPayload] = await Promise.all([
      $fetch(String(listEndpoint), { query }),
      countEndpoint ? $fetch(String(countEndpoint)) : $fetch('/api/v1/admin/users/count'),
      $fetch('/api/v1/admin/users/ids'),
    ])

    return { payload, countPayload }
  },
  saveEdit: async (row) => {
    const passwordValue = String(row.password ?? '').trim()
    if (passwordValue && passwordValue.length < 8) {
      Notify.error(String(useNuxtApp().$i18n.t('notifications.ui.passwordRequired')))
      return
    }

    const schemaEditableFields = userSchema.value?.editable?.map(field => field.name) ?? []
    const editableFieldNames = schemaEditableFields.length > 0
      ? schemaEditableFields
      : fallbackDetailFields.map(field => field.key)

    const patchBody = editableFieldNames.reduce<Record<string, unknown>>((acc, fieldName) => {
      if (fieldName in row) {
        acc[fieldName] = row[fieldName]
      }

      return acc
    }, {})

    if (passwordValue) {
      patchBody.password = passwordValue
    }

    try {
      await $fetch(
        String(resolveAdminEndpoint(usersDescriptor.patch, String(row.id ?? '')) ?? `/api/user/${encodeURIComponent(String(row.id ?? ''))}`) as any,
        {
          method: 'PATCH' as any,
          body: patchBody,
        },
      )

      Notify.success(String(useNuxtApp().$i18n.t('notifications.ui.userUpdatedActionSuccess')))
      track({
        name: 'admin.users.patch',
        payload: {
          id: String(row.id ?? ''),
          username: String(row.username ?? ''),
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
        String(resolveAdminEndpoint(usersDescriptor.delete, String(row.id ?? '')) ?? `/api/user/${encodeURIComponent(String(row.id ?? ''))}`) as any,
        {
          method: 'DELETE' as any,
        },
      )

      Notify.success(String(useNuxtApp().$i18n.t('notifications.ui.userDeletedActionSuccess')))
      track({
        name: 'admin.users.delete',
        payload: {
          id: String(row.id ?? ''),
          username: String(row.username ?? ''),
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

const rowPatchLoadingByKey = ref<Record<string, boolean>>({})

const rowPatchLoadingKeys = computed(() => Object.keys(rowPatchLoadingByKey.value))

function getRowPatchKey(rowId: string, field: string) {
  return `${rowId}:${field}`
}

async function onRowPatch(payload: { rowId: string; field: string; value: boolean }) {
  const rowPatchKey = getRowPatchKey(payload.rowId, payload.field)
  if (rowPatchLoadingByKey.value[rowPatchKey]) {
    return
  }

  const targetRow = rows.value.find((row) => String(row.id ?? '') === payload.rowId)
  if (!targetRow) {
    return
  }

  const previousValue = Boolean(targetRow[payload.field])
  targetRow[payload.field] = payload.value
  rowPatchLoadingByKey.value = {
    ...rowPatchLoadingByKey.value,
    [rowPatchKey]: true,
  }

  try {
    await $fetch(String(resolveAdminEndpoint(usersDescriptor.patch, payload.rowId) ?? `/api/user/${encodeURIComponent(payload.rowId)}`) as any, {
      method: 'PATCH' as any,
      body: {
        [payload.field]: payload.value,
      },
    })
  } catch (errorValue) {
    targetRow[payload.field] = previousValue
    Notify.error(
      `Action échouée : ${errorValue instanceof Error ? errorValue.message : 'Erreur API.'}`,
    )
  } finally {
    const { [rowPatchKey]: _removed, ...remaining } = rowPatchLoadingByKey.value
    rowPatchLoadingByKey.value = remaining
  }
}

function createRow() {
  if (!canCreate.value) {
    return
  }

  createForm.username = ''
  createForm.email = ''
  createForm.firstName = ''
  createForm.lastName = ''
  createForm.password = ''
  createOpen.value = true
}

async function submitCreateRow() {
  if (
    !createForm.username.trim() ||
    !createForm.email.trim() ||
    !createForm.password.trim()
  ) {
    Notify.error(String(useNuxtApp().$i18n.t('notifications.ui.userFieldsRequired')))
    return
  }

  creating.value = true

  try {
    await $fetch(String(resolveAdminEndpoint(usersDescriptor.create) ?? '/api/v1/admin/users'), {
      method: 'POST' as any,
      body: {
        username: createForm.username.trim(),
        email: createForm.email.trim(),
        firstName: createForm.firstName.trim() || undefined,
        lastName: createForm.lastName.trim() || undefined,
        password: createForm.password,
      },
    })

    Notify.success(String(useNuxtApp().$i18n.t('notifications.ui.userCreatedActionSuccess')))
    track({
      name: 'admin.users.create',
      payload: { username: createForm.username.trim() },
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
  await loadSchema()
  await Promise.all([loadRows(), loadAvailableGroups()])
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
      :editable-fields="editableFields"
      :can-show="canShow"
      :can-create="canCreate"
      :can-edit="canEdit"
      :can-delete="canDelete"
      :mutation-loading="mutationLoading"
      :row-patch-loading-keys="rowPatchLoadingKeys"
      :entity-definition="usersEntityDefinition"
      @update:page="page = $event"
      @update:page-size="pageSize = $event"
      @update:sort-by="sortBy = $event"
      @update:search="search = $event"
      @update:filters="filters = $event"
      @row-show="onRowShow"
      @row-patch="onRowPatch"
      @create="createRow"
      @save-edit="saveEdit"
      @row-delete="deleteRow"
      @refresh="loadRows"
    >
      <template #detail-content>
        <div v-if="selectedDetailUser">
          <v-row dense>
            <v-col v-for="field in detailFields" :key="field.key" cols="12" md="6">
              <div class="text-subtitle-2">{{ field.label }}</div>
              <div class="text-body-1">{{ String(selectedDetailUser[field.key] ?? '-') }}</div>
            </v-col>
          </v-row>

          <v-progress-linear v-if="detailLoading" indeterminate color="primary" class="my-4" />

          <div class="text-subtitle-1 mt-4 mb-2">Rôles</div>
          <div v-if="detailRoles.length === 0" class="text-medium-emphasis mb-4">Aucun rôle.</div>
          <div v-else class="d-flex flex-wrap ga-2 mb-4">
            <v-chip v-for="roleName in detailRoles" :key="roleName" size="small" variant="outlined">
              {{ roleName }}
            </v-chip>
          </div>

          <div class="text-subtitle-1 mb-2">Groupes</div>
          <div v-if="detailGroups.length === 0" class="text-medium-emphasis mb-3">Aucun groupe.</div>
          <div v-else class="d-flex flex-wrap ga-2 mb-3">
            <v-chip
              v-for="group in detailGroups"
              :key="group.id"
              size="small"
              variant="outlined"
              :closable="canManageGroups"
              :disabled="detailActionLoading"
              @click:close="detachGroup(group.id)"
            >
              {{ group.name }}
            </v-chip>
          </div>

          <v-row dense>
            <v-col cols="12" md="8">
              <v-select
                v-model="selectedGroupId"
                label="Ajouter un groupe"
                :items="availableGroupOptions"
                item-title="title"
                item-value="value"
                hide-details
                density="comfortable"
                :loading="groupOptionsLoading"
                :disabled="!canManageGroups || detailActionLoading"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-btn
                block
                color="primary"
                :loading="detailActionLoading"
                :disabled="!canManageGroups || !selectedGroupId"
                @click="attachGroup"
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
        <v-card-title>Créer un utilisateur</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="createForm.username"
            label="Username*"
            class="mb-2"
          />
          <v-text-field
            v-model="createForm.email"
            label="Email*"
            type="email"
            class="mb-2"
          />
          <v-text-field
            v-model="createForm.firstName"
            label="First name"
            class="mb-2"
          />
          <v-text-field
            v-model="createForm.lastName"
            label="Last name"
            class="mb-2"
          />
          <v-text-field
            v-model="createForm.password"
            label="Password*"
            type="password"
          />
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
