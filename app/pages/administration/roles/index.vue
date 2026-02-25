<script setup lang="ts">
import { FORBIDDEN_MESSAGE } from '~/utils/permissions/messages'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import { Notify } from '~/stores/notification'

type RoleRecord = {
  id: string
  name: string
  description: string
}

definePageMeta({
  icon: 'mdi-shield-account-outline',
  title: 'Roles',
  drawerIndex: 73,
  requiresAuth: true,
  requiresAdmin: true,
  middleware: ['auth', 'admin-access'],
})

const authStore = useAuthStore()
const { roles } = storeToRefs(authStore)

const loading = ref(false)
const detailsLoading = ref(false)
const apiError = ref<string | null>(null)

const roleList = ref<RoleRecord[]>([])
const roleIds = ref<string[]>([])
const roleCount = ref(0)

const selectedRoleId = ref<string>('')
const selectedRole = ref<RoleRecord | null>(null)
const selectedInheritedRoles = ref<string[]>([])

const canShow = computed(() =>
  ['ROLE_ADMIN', 'ROLE_ROOT'].some((roleName) =>
    roles.value.includes(roleName),
  ),
)

function toErrorMessage(error: unknown) {
  if (isError(error) && error.statusCode === 403) {
    return FORBIDDEN_MESSAGE
  }

  if (isError(error) && typeof error.statusMessage === 'string') {
    return error.statusMessage
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Une erreur API est survenue.'
}

function normalizeRole(entry: unknown): RoleRecord {
  const row = (entry ?? {}) as Record<string, unknown>

  return {
    id: String(row.id ?? row.uuid ?? ''),
    name: String(
      row.name ?? row.code ?? row.label ?? row.id ?? 'Rôle sans nom',
    ),
    description: String(row.description ?? row.label ?? ''),
  }
}

function normalizeRoleList(payload: unknown): RoleRecord[] {
  const records = Array.isArray(payload)
    ? payload
    : payload &&
        typeof payload === 'object' &&
        Array.isArray((payload as { items?: unknown[] }).items)
      ? (payload as { items: unknown[] }).items
      : payload &&
          typeof payload === 'object' &&
          Array.isArray((payload as { data?: unknown[] }).data)
        ? (payload as { data: unknown[] }).data
        : []

  return records.map((entry) => normalizeRole(entry))
}

function normalizeInherited(payload: unknown): string[] {
  if (Array.isArray(payload)) {
    return payload
      .map((item) => {
        if (typeof item === 'string') {
          return item
        }

        if (item && typeof item === 'object') {
          const record = item as Record<string, unknown>
          return String(
            record.id ?? record.uuid ?? record.name ?? record.code ?? '',
          )
        }

        return String(item)
      })
      .filter(Boolean)
  }

  if (
    payload &&
    typeof payload === 'object' &&
    Array.isArray((payload as { inherited?: unknown[] }).inherited)
  ) {
    return normalizeInherited((payload as { inherited: unknown[] }).inherited)
  }

  return []
}

async function loadRoleInventory() {
  loading.value = true
  apiError.value = null

  try {
    const [listResponse, countResponse, idsResponse] = await Promise.all([
      $fetch('/api/role'),
      $fetch('/api/role/count'),
      $fetch('/api/role/ids'),
    ])

    roleList.value = normalizeRoleList(listResponse)
    roleCount.value =
      typeof countResponse === 'number'
        ? countResponse
        : Number(
            (countResponse as { count?: number })?.count ??
              roleList.value.length,
          )

    roleIds.value = Array.isArray(idsResponse) ? idsResponse.map(String) : []

    if (!selectedRoleId.value && roleIds.value.length > 0) {
      selectedRoleId.value = roleIds.value[0]!
    }

    if (selectedRoleId.value) {
      await loadRoleDetails(selectedRoleId.value)
    }
  } catch (error) {
    apiError.value = toErrorMessage(error)
    Notify.error(apiError.value)
  } finally {
    loading.value = false
  }
}

async function loadRoleDetails(roleId: string) {
  if (!roleId) {
    return
  }

  detailsLoading.value = true

  try {
    const [detailResponse, inheritedResponse] = await Promise.all([
      $fetch(`/api/role/${encodeURIComponent(roleId)}`),
      $fetch(`/api/role/${encodeURIComponent(roleId)}/inherited`),
    ])

    selectedRole.value = normalizeRole(detailResponse)
    selectedInheritedRoles.value = normalizeInherited(inheritedResponse)
  } catch (error) {
    Notify.error(toErrorMessage(error))
  } finally {
    detailsLoading.value = false
  }
}

watch(selectedRoleId, async (roleId) => {
  if (!roleId) {
    selectedRole.value = null
    selectedInheritedRoles.value = []
    return
  }

  await loadRoleDetails(roleId)
})

onMounted(async () => {
  await loadRoleInventory()
})
</script>

<template>
  <v-container fluid class="pa-6">
    <v-card rounded="xl" elevation="6" class="pa-6">
      <div
        class="d-flex align-center justify-space-between flex-wrap ga-3 mb-4"
      >
        <h1 class="text-h4 font-weight-bold">Roles</h1>
        <v-btn
          color="primary"
          variant="tonal"
          prepend-icon="mdi-refresh"
          :loading="loading"
          @click="loadRoleInventory"
        >
          Recharger
        </v-btn>
      </div>

      <PermissionGate
        :allowed="canShow"
        mode="alert"
        message="Accès réservé aux utilisateurs ROLE_ADMIN et ROLE_ROOT."
        class="mb-4"
      >
        <v-row class="mb-4" dense>
          <v-col cols="12" md="4">
            <v-card variant="tonal" rounded="lg" class="pa-4">
              <div class="text-overline">Total des rôles</div>
              <div class="text-h5 font-weight-bold">{{ roleCount }}</div>
            </v-card>
          </v-col>
          <v-col cols="12" md="8">
            <v-card variant="tonal" rounded="lg" class="pa-4">
              <div class="text-overline mb-2">IDs disponibles</div>
              <div class="d-flex flex-wrap ga-2">
                <v-chip
                  v-for="id in roleIds"
                  :key="id"
                  size="small"
                  variant="outlined"
                  >{{ id }}</v-chip
                >
                <span v-if="roleIds.length === 0" class="text-medium-emphasis"
                  >Aucun ID retourné.</span
                >
              </div>
            </v-card>
          </v-col>
        </v-row>

        <AdminPageError :message="apiError" />

        <v-row dense>
          <v-col cols="12" md="5">
            <v-card rounded="lg" variant="outlined">
              <v-card-title class="text-subtitle-1"
                >Rôles disponibles</v-card-title
              >
              <v-divider />
              <v-card-text>
                <v-progress-linear v-if="loading" indeterminate class="mb-3" />
                <v-select
                  v-model="selectedRoleId"
                  :items="roleIds"
                  label="Sélectionner un rôle"
                  density="comfortable"
                  variant="outlined"
                  hide-details
                />
                <v-list class="mt-3" density="compact" lines="two">
                  <v-list-item
                    v-for="role in roleList"
                    :key="role.id"
                    :active="selectedRoleId === role.id"
                    @click="selectedRoleId = role.id"
                  >
                    <v-list-item-title>{{ role.name }}</v-list-item-title>
                    <v-list-item-subtitle>{{ role.id }}</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="7">
            <v-card rounded="lg" variant="outlined">
              <v-card-title class="text-subtitle-1"
                >Arborescence du rôle</v-card-title
              >
              <v-divider />
              <v-card-text>
                <v-progress-linear
                  v-if="detailsLoading"
                  indeterminate
                  class="mb-3"
                />

                <v-alert
                  v-if="!selectedRole"
                  type="info"
                  variant="tonal"
                  density="comfortable"
                >
                  Sélectionnez un rôle pour afficher son détail et son héritage.
                </v-alert>

                <v-list v-else density="comfortable">
                  <v-list-item prepend-icon="mdi-shield-key-outline">
                    <v-list-item-title class="font-weight-bold">{{
                      selectedRole.name
                    }}</v-list-item-title>
                    <v-list-item-subtitle>{{
                      selectedRole.id
                    }}</v-list-item-subtitle>
                  </v-list-item>

                  <v-list-group
                    value="inherited"
                    prepend-icon="mdi-source-branch"
                  >
                    <template #activator="{ props }">
                      <v-list-item
                        v-bind="props"
                        title="Inherited roles"
                        :subtitle="`${selectedInheritedRoles.length} rôle(s)`"
                      />
                    </template>

                    <v-list-item
                      v-for="inheritedRole in selectedInheritedRoles"
                      :key="inheritedRole"
                      :title="inheritedRole"
                      prepend-icon="mdi-shield-outline"
                    />

                    <v-list-item
                      v-if="selectedInheritedRoles.length === 0"
                      title="Aucun rôle hérité"
                      prepend-icon="mdi-minus"
                    />
                  </v-list-group>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </PermissionGate>
    </v-card>
  </v-container>
</template>
