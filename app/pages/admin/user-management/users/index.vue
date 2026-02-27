<script setup lang="ts">
import type { DataTableHeader } from 'vuetify'
import { storeToRefs } from 'pinia'
import { Notify } from '~/stores/notification'
import { useAuthStore } from '~/stores/auth'
import { canManageUsers, isRoot } from '~/utils/permissions/admin'
import { useInternalEventTracking } from '~/composables/useInternalEventTracking'
import { extractCollectionFromPayload } from '~/utils/admin/extractCollectionFromPayload'
import type { AdminResourceSchema, AdminSchemaField } from '~/types/admin-schema'

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
const canManageGroups = computed(() => isRoot(roles.value))

const createOpen = ref(false)
const creating = ref(false)
const detailRoles = ref<string[]>([])
const detailGroups = ref<UserGroup[]>([])
const detailLoading = ref(false)
const detailActionLoading = ref(false)
const selectedDetailUser = ref<UserRecord | null>(null)
const selectedGroupId = ref('')
const availableGroups = ref<UserGroup[]>([])
const loadingGroupOptions = ref(false)
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

const userSchema = ref<AdminResourceSchema | null>(null)

function toFieldLabel(fieldName: string) {
  return fieldName
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .replace(/[_.-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, value => value.toUpperCase())
}

function normalizeSchemaField(entry: unknown): AdminSchemaField | null {
  if (!entry || typeof entry !== 'object') {
    return null
  }

  const row = entry as Record<string, unknown>
  const name = String(row.name ?? '').trim()

  if (!name) {
    return null
  }

  return {
    name,
    type: String(row.type ?? '').trim() || undefined,
    targetClass: String(row.targetClass ?? '').trim() || undefined,
    endpoint: String(row.endpoint ?? '').trim() || undefined,
  }
}

function normalizeSchema(payload: unknown): AdminResourceSchema | null {
  if (!payload || typeof payload !== 'object') {
    return null
  }

  const body = payload as { displayable?: unknown; editable?: unknown }
  const displayable = Array.isArray(body.displayable)
    ? body.displayable.map(normalizeSchemaField).filter((field): field is AdminSchemaField => Boolean(field))
    : []
  const editable = Array.isArray(body.editable)
    ? body.editable.map(normalizeSchemaField).filter((field): field is AdminSchemaField => Boolean(field))
    : []

  if (displayable.length === 0 && editable.length === 0) {
    return null
  }

  return { displayable, editable }
}

const columns = computed<DataTableHeader[]>(() => {
  if (!userSchema.value?.displayable?.length) {
    return fallbackColumns
  }

  return userSchema.value.displayable.map(field => ({
    title: toFieldLabel(field.name),
    key: field.name,
  }))
})

const detailFields = computed(() => {
  if (!userSchema.value?.editable?.length) {
    return fallbackDetailFields
  }

  return userSchema.value.editable.map(field => ({
    key: field.name,
    label: toFieldLabel(field.name),
  }))
})

const editableFields = computed(() => detailFields.value)

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
    const payload = await $fetch('/api/user/schema')
    userSchema.value = normalizeSchema(payload)
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

function normalizeGroupList(payload: unknown): UserGroup[] {
  const records = Array.isArray(payload)
    ? payload
    : payload && typeof payload === 'object' && Array.isArray((payload as { items?: unknown[] }).items)
      ? (payload as { items: unknown[] }).items
      : payload && typeof payload === 'object' && Array.isArray((payload as { data?: unknown[] }).data)
        ? (payload as { data: unknown[] }).data
        : []

  return records
    .map((entry) => {
      if (!entry || typeof entry !== 'object') {
        return null
      }

      const row = entry as Record<string, unknown>

      return {
        id: String(row.id ?? '').trim(),
        name: String(row.name ?? row.id ?? '').trim(),
      }
    })
    .filter((group): group is UserGroup => Boolean(group?.id))
}

const availableGroupOptions = computed(() => {
  const attachedIds = new Set(detailGroups.value.map((group) => group.id))

  return availableGroups.value
    .filter((group) => !attachedIds.has(group.id))
    .map((group) => ({
      title: group.name,
      value: group.id,
    }))
})

async function loadAvailableGroups() {
  loadingGroupOptions.value = true

  try {
    const payload = await $fetch('/api/user_group', {
      query: {
        limit: 200,
        offset: 0,
      },
    })
    availableGroups.value = normalizeGroupList(payload)
  } catch (errorValue) {
    Notify.error(
      `Impossible de charger les groupes disponibles : ${errorValue instanceof Error ? errorValue.message : 'Erreur API.'}`,
    )
    availableGroups.value = []
  } finally {
    loadingGroupOptions.value = false
  }
}

async function loadUserDetails(userId: string) {
  if (!userId) {
    return
  }

  detailLoading.value = true

  try {
    const [rolesPayload, groupsPayload] = await Promise.all([
      $fetch(`/api/user/${encodeURIComponent(userId)}/roles`),
      $fetch(`/api/user/${encodeURIComponent(userId)}/groups`),
    ])

    detailRoles.value = normalizeStringList(rolesPayload)
    detailGroups.value = normalizeGroupList(groupsPayload)
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
    await $fetch(`/api/user/${encodeURIComponent(selectedDetailUser.value.id)}/group/${encodeURIComponent(groupId)}`, {
      method: 'DELETE',
    })
    Notify.success('Groupe détaché avec succès.')
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
    await $fetch(`/api/user/${encodeURIComponent(selectedDetailUser.value.id)}/group/${encodeURIComponent(selectedGroupId.value)}`, {
      method: 'POST',
    })
    Notify.success('Groupe attaché avec succès.')
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
  initialFilters: {},
  normalize,
  buildQuery,
  loadRows: async (ctx) => {
    const query = buildQuery(ctx)
    const [payload, countPayload] = await Promise.all([
      $fetch('/api/user', { query }),
      $fetch('/api/user/count'),
      $fetch('/api/user/ids'),
    ])

    return { payload, countPayload }
  },
  saveEdit: async (row) => {
    const passwordValue = String(row.password ?? '').trim()
    if (passwordValue && passwordValue.length < 8) {
      Notify.error('Le mot de passe est requis (8 caractères minimum).')
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
        `/api/user/${encodeURIComponent(String(row.id ?? ''))}` as any,
        {
          method: 'PATCH' as any,
          body: patchBody,
        },
      )

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
      Notify.error(
        `Action échouée : ${errorValue instanceof Error ? errorValue.message : 'Erreur API.'}`,
      )
    }
  },
  deleteRow: async (row) => {
    try {
      await $fetch(
        `/api/user/${encodeURIComponent(String(row.id ?? ''))}` as any,
        {
          method: 'DELETE' as any,
        },
      )

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
    Notify.error('Username, email et mot de passe sont requis.')
    return
  }

  creating.value = true

  try {
    await $fetch('/api/user', {
      method: 'POST' as any,
      body: {
        username: createForm.username.trim(),
        email: createForm.email.trim(),
        firstName: createForm.firstName.trim() || undefined,
        lastName: createForm.lastName.trim() || undefined,
        password: createForm.password,
      },
    })

    Notify.success('Action réussie : utilisateur créé.')
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
      resource-name="l'utilisateur"
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
                :loading="loadingGroupOptions"
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
