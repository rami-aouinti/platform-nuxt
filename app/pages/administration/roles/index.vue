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

const selectedRoleId = ref<string | null>(null)
const roleDetails = ref<RoleRecord | null>(null)
const inheritedRoles = ref<RoleRecord[]>([])
const roleIds = ref<string[]>([])

const roleIdsLoading = ref(false)
const roleIdsError = ref<string | null>(null)
const roleDetailsLoading = ref(false)
const roleDetailsError = ref<string | null>(null)
const inheritedRolesLoading = ref(false)
const inheritedRolesError = ref<string | null>(null)

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

function normalizeRoleFromUnknown(entry: unknown): RoleRecord {
  const row = entry as Record<string, unknown>
  return {
    id: String(row.id ?? row.uuid ?? row.name ?? ''),
    name: String(row.name ?? row.id ?? ''),
    description: String(row.description ?? ''),
  }
}

function parseApiError(errorValue: unknown): string {
  if (errorValue instanceof Error && errorValue.message) {
    return errorValue.message
  }

  return 'Erreur API.'
}

async function loadRoleIds() {
  roleIdsLoading.value = true
  roleIdsError.value = null

  try {
    const payload = await $fetch('/api/role/ids')
    const collection = extractCollectionFromPayload(payload)

    roleIds.value = collection
      .map((entry) => {
        if (typeof entry === 'string' || typeof entry === 'number') {
          return String(entry)
        }

        const row = entry as Record<string, unknown>
        return String(row.id ?? row.uuid ?? row.name ?? '')
      })
      .map((value) => value.trim())
      .filter(Boolean)
  } catch (errorValue) {
    roleIds.value = []
    roleIdsError.value = parseApiError(errorValue)
  } finally {
    roleIdsLoading.value = false
  }
}

async function loadSelectedRoleDetails(roleId: string) {
  selectedRoleId.value = roleId
  roleDetailsLoading.value = true
  inheritedRolesLoading.value = true
  roleDetailsError.value = null
  inheritedRolesError.value = null

  try {
    const payload = await $fetch(`/api/role/${encodeURIComponent(roleId)}`)
    const [firstCollectionEntry] = extractCollectionFromPayload(payload)
    const source = firstCollectionEntry ?? payload
    roleDetails.value = normalizeRoleFromUnknown(source)
  } catch (errorValue) {
    roleDetails.value = null
    roleDetailsError.value = parseApiError(errorValue)
  } finally {
    roleDetailsLoading.value = false
  }

  try {
    const payload = await $fetch(`/api/role/${encodeURIComponent(roleId)}/inherited`)
    inheritedRoles.value = extractCollectionFromPayload(payload).map(normalizeRoleFromUnknown)
  } catch (errorValue) {
    inheritedRoles.value = []
    inheritedRolesError.value = parseApiError(errorValue)
  } finally {
    inheritedRolesLoading.value = false
  }
}

async function refreshAll() {
  await Promise.all([
    loadRows(),
    loadRoleIds(),
  ])

  if (selectedRoleId.value) {
    await loadSelectedRoleDetails(selectedRoleId.value)
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

async function handleSelectRole(row: Record<string, unknown>) {
  const id = String(row.id ?? '').trim()
  if (!id) {
    return
  }

  await loadSelectedRoleDetails(id)
}

onMounted(async () => {
  await authStore.ensureRolesLoaded()
  await refreshAll()
})
</script>

<template>
  <div class="d-flex flex-column ga-4">
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
      @row-show="handleSelectRole"
      @refresh="refreshAll"
    />

    <v-card>
      <v-card-title>Identifiants de rôles</v-card-title>
      <v-card-text>
        <v-progress-linear v-if="roleIdsLoading" indeterminate color="primary" class="mb-3" />
        <v-alert v-else-if="roleIdsError" type="error" variant="tonal" density="comfortable">
          {{ roleIdsError }}
        </v-alert>
        <v-alert v-else-if="!roleIds.length" type="info" variant="tonal" density="comfortable">
          Aucun identifiant de rôle disponible.
        </v-alert>
        <div v-else class="d-flex flex-wrap ga-2">
          <v-chip
            v-for="id in roleIds"
            :key="id"
            :color="selectedRoleId === id ? 'primary' : undefined"
            :variant="selectedRoleId === id ? 'flat' : 'outlined'"
            @click="loadSelectedRoleDetails(id)"
          >
            {{ id }}
          </v-chip>
        </div>
      </v-card-text>
    </v-card>

    <v-card>
      <v-card-title>Détails du rôle sélectionné</v-card-title>
      <v-card-text>
        <v-progress-linear v-if="roleDetailsLoading || inheritedRolesLoading" indeterminate color="primary" class="mb-3" />
        <v-alert
          v-if="!selectedRoleId"
          type="info"
          variant="tonal"
          density="comfortable"
          class="mb-3"
        >
          Sélectionnez un rôle pour afficher ses informations et ses héritages.
        </v-alert>

        <template v-else>
          <v-alert
            v-if="roleDetailsError"
            type="error"
            variant="tonal"
            density="comfortable"
            class="mb-3"
          >
            {{ roleDetailsError }}
          </v-alert>
          <v-alert
            v-else-if="!roleDetails"
            type="info"
            variant="tonal"
            density="comfortable"
            class="mb-3"
          >
            Aucun détail de rôle trouvé.
          </v-alert>
          <v-list v-else lines="one" class="mb-3">
            <v-list-item title="ID" :subtitle="roleDetails.id" />
            <v-list-item title="Description" :subtitle="roleDetails.description || '-'" />
          </v-list>

          <v-alert
            v-if="inheritedRolesError"
            type="error"
            variant="tonal"
            density="comfortable"
          >
            {{ inheritedRolesError }}
          </v-alert>
          <v-alert
            v-else-if="!inheritedRoles.length"
            type="info"
            variant="tonal"
            density="comfortable"
          >
            Aucun rôle hérité.
          </v-alert>
          <v-list v-else lines="one">
            <v-list-item
              v-for="inheritedRole in inheritedRoles"
              :key="`${inheritedRole.id}-${inheritedRole.name}`"
              :title="inheritedRole.id"
              :subtitle="inheritedRole.description || inheritedRole.name || '-'"
            />
          </v-list>
        </template>
      </v-card-text>
    </v-card>
  </div>
</template>
