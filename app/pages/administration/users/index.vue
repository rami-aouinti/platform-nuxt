<script setup lang="ts">
import type { DataTableHeader } from 'vuetify'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import { Notify } from '~/stores/notification'

type UserRecord = {
  id: string
  username: string
  email: string
  roles: string[]
  groups: string[]
}

definePageMeta({
  icon: 'mdi-account-multiple-outline',
  title: 'Users',
  drawerIndex: 71,
  requiresAuth: true,
  requiresAdmin: true,
  middleware: ['auth', 'admin-access'],
})

const authStore = useAuthStore()
const { roles } = storeToRefs(authStore)

const loading = ref(false)
const apiError = ref<string | null>(null)
const users = ref<UserRecord[]>([])
const totalUsers = ref(0)
const availableIds = ref<string[]>([])

const page = ref(1)
const itemsPerPage = ref(10)
const search = ref('')
const roleFilter = ref('')
const groupFilter = ref('')

const selectedUser = ref<UserRecord | null>(null)
const editUser = ref<UserRecord | null>(null)
const showDialog = ref(false)
const editDialog = ref(false)
const editSaving = ref(false)

const headers: DataTableHeader[] = [
  { title: 'ID', key: 'id' },
  { title: 'Username', key: 'username' },
  { title: 'Email', key: 'email' },
  { title: 'Rôles', key: 'roles' },
  { title: 'Groupes', key: 'groups' },
  { title: 'Actions', key: 'actions', sortable: false },
]

const canShow = computed(() =>
  ['ROLE_ADMIN', 'ROLE_ROOT'].some((roleName) => roles.value.includes(roleName)),
)
const canEdit = computed(() => roles.value.includes('ROLE_ROOT'))
const canDelete = computed(() => roles.value.includes('ROLE_ROOT'))

function normalizeUsers(payload: unknown): UserRecord[] {
  const records = Array.isArray(payload)
    ? payload
    : payload && typeof payload === 'object' && Array.isArray((payload as { items?: unknown[] }).items)
      ? (payload as { items: unknown[] }).items
      : payload && typeof payload === 'object' && Array.isArray((payload as { data?: unknown[] }).data)
        ? (payload as { data: unknown[] }).data
        : []

  return records.map((entry, index) => {
    const row = entry as Record<string, unknown>
    const rolesValue = Array.isArray(row.roles) ? row.roles.map(String) : []
    const groupsValue = Array.isArray(row.groups)
      ? row.groups.map((group) => {
          if (typeof group === 'string') {
            return group
          }
          if (group && typeof group === 'object' && 'name' in group) {
            return String((group as { name: unknown }).name)
          }
          return String(group)
        })
      : []

    return {
      id: String(row.id ?? row.uuid ?? index),
      username: String(row.username ?? row.userName ?? ''),
      email: String(row.email ?? ''),
      roles: rolesValue,
      groups: groupsValue,
    }
  })
}

function toErrorMessage(error: unknown) {
  if (isError(error) && error.statusCode === 403) {
    return 'Accès refusé (403) : vous n’avez pas les permissions nécessaires pour cette action.'
  }

  if (isError(error) && typeof error.statusMessage === 'string') {
    return error.statusMessage
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Une erreur API est survenue.'
}

async function loadUsers() {
  loading.value = true
  apiError.value = null

  try {
    const query = {
      page: page.value,
      limit: itemsPerPage.value,
      search: search.value || undefined,
      role: roleFilter.value || undefined,
      group: groupFilter.value || undefined,
    }

    const [listResponse, countResponse, idsResponse] = await Promise.all([
      $fetch('/api/user', { query }),
      $fetch('/api/user/count'),
      $fetch('/api/user/ids'),
    ])

    users.value = normalizeUsers(listResponse)
    totalUsers.value =
      typeof countResponse === 'number'
        ? countResponse
        : Number((countResponse as { count?: number })?.count ?? users.value.length)

    availableIds.value = Array.isArray(idsResponse) ? idsResponse.map(String) : []
  } catch (error) {
    apiError.value = toErrorMessage(error)
    Notify.error(apiError.value)
  } finally {
    loading.value = false
  }
}

async function showUserDetails(id: string) {
  try {
    const response = await $fetch(`/api/user/${encodeURIComponent(id)}`)
    const normalized = normalizeUsers([response])[0] ?? null
    selectedUser.value = normalized
    showDialog.value = true
  } catch (error) {
    Notify.error(toErrorMessage(error))
  }
}

async function openEditDialog(user: UserRecord) {
  try {
    const response = await $fetch(`/api/user/${encodeURIComponent(user.id)}`)
    editUser.value = normalizeUsers([response])[0] ?? null
    editDialog.value = true
  } catch (error) {
    Notify.error(toErrorMessage(error))
  }
}

async function saveEdit() {
  if (!editUser.value) {
    return
  }

  editSaving.value = true

  try {
    await $fetch(`/api/user/${encodeURIComponent(editUser.value.id)}` as any, {
      method: 'PATCH' as any,
      body: {
        username: editUser.value.username,
        email: editUser.value.email,
      },
    })

    Notify.success('Utilisateur mis à jour.')
    editDialog.value = false
    await loadUsers()
  } catch (error) {
    Notify.error(toErrorMessage(error))
  } finally {
    editSaving.value = false
  }
}

const dialogDelete = useTemplateRef('dialogDelete')

async function deleteUser(user: UserRecord) {
  const confirmed = await dialogDelete.value?.open(
    `Supprimer l’utilisateur ${user.username} ?`,
  )

  if (!confirmed) {
    return
  }

  try {
    await $fetch(`/api/user/${encodeURIComponent(user.id)}` as any, {
      method: 'DELETE' as any,
    })

    Notify.success('Utilisateur supprimé.')
    await loadUsers()
  } catch (error) {
    Notify.error(toErrorMessage(error))
  }
}

watch([page, itemsPerPage], async () => {
  await loadUsers()
})

watchDebounced(
  [search, roleFilter, groupFilter],
  async () => {
    page.value = 1
    await loadUsers()
  },
  { debounce: 350, maxWait: 1200 },
)

onMounted(async () => {
  await authStore.ensureRolesLoaded()
  await loadUsers()
})
</script>

<template>
  <v-container fluid class="pa-6">
    <v-card rounded="xl" elevation="6" class="pa-6">
      <div class="d-flex flex-wrap justify-space-between align-center ga-4 mb-4">
        <h1 class="text-h4 font-weight-bold">Administration · Users</h1>
        <div class="text-caption text-medium-emphasis">
          Total: {{ totalUsers }} · IDs reçus: {{ availableIds.length }}
        </div>
      </div>

      <v-alert
        v-if="apiError"
        type="error"
        variant="tonal"
        density="comfortable"
        class="mb-4"
      >
        {{ apiError }}
      </v-alert>

      <v-row class="mb-2" dense>
        <v-col cols="12" md="4">
          <v-text-field
            v-model="search"
            label="Recherche"
            prepend-inner-icon="mdi-magnify"
            density="comfortable"
            hide-details
            clearable
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field
            v-model="roleFilter"
            label="Filtre rôle"
            prepend-inner-icon="mdi-shield-account-outline"
            density="comfortable"
            hide-details
            clearable
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field
            v-model="groupFilter"
            label="Filtre groupe"
            prepend-inner-icon="mdi-account-group-outline"
            density="comfortable"
            hide-details
            clearable
          />
        </v-col>
      </v-row>

      <v-data-table-server
        v-model:page="page"
        v-model:items-per-page="itemsPerPage"
        :headers="headers"
        :items="users"
        :items-length="totalUsers"
        :loading="loading"
        item-value="id"
      >
        <template #item.roles="{ item }">
          <div class="d-flex flex-wrap ga-1">
            <v-chip
              v-for="roleName in item.roles"
              :key="roleName"
              size="small"
              color="primary"
              variant="tonal"
            >
              {{ roleName }}
            </v-chip>
          </div>
        </template>

        <template #item.groups="{ item }">
          <div class="d-flex flex-wrap ga-1">
            <v-chip
              v-for="groupName in item.groups"
              :key="groupName"
              size="small"
              color="secondary"
              variant="tonal"
            >
              {{ groupName }}
            </v-chip>
          </div>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex ga-1">
            <v-btn
              size="small"
              icon="mdi-eye-outline"
              variant="text"
              color="info"
              :disabled="!canShow"
              @click="showUserDetails(item.id)"
            />
            <v-btn
              size="small"
              icon="mdi-pencil-outline"
              variant="text"
              color="warning"
              :disabled="!canEdit"
              @click="openEditDialog(item)"
            />
            <v-btn
              size="small"
              icon="mdi-delete-outline"
              variant="text"
              color="error"
              :disabled="!canDelete"
              @click="deleteUser(item)"
            />
          </div>
        </template>
      </v-data-table-server>
    </v-card>

    <DialogConfirm ref="dialogDelete" />

    <v-dialog v-model="showDialog" max-width="620">
      <v-card v-if="selectedUser">
        <v-card-title>Détails utilisateur</v-card-title>
        <v-card-text>
          <div><strong>ID:</strong> {{ selectedUser.id }}</div>
          <div><strong>Username:</strong> {{ selectedUser.username }}</div>
          <div><strong>Email:</strong> {{ selectedUser.email }}</div>
          <div><strong>Rôles:</strong> {{ selectedUser.roles.join(', ') || '-' }}</div>
          <div><strong>Groupes:</strong> {{ selectedUser.groups.join(', ') || '-' }}</div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="showDialog = false">Fermer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="editDialog" max-width="640">
      <v-card v-if="editUser">
        <v-card-title>Éditer utilisateur</v-card-title>
        <v-card-text class="pt-4">
          <v-text-field v-model="editUser.username" label="Username" class="mb-2" />
          <v-text-field v-model="editUser.email" label="Email" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="editDialog = false">Annuler</v-btn>
          <v-btn color="primary" :loading="editSaving" @click="saveEdit">Enregistrer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
