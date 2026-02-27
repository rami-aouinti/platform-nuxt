<script setup lang="ts">
import type { DataTableHeader } from 'vuetify'
import { storeToRefs } from 'pinia'
import { Notify } from '~/stores/notification'
import { useAuthStore } from '~/stores/auth'
import { canManageUsers, isRoot } from '~/utils/permissions/admin'
import { useInternalEventTracking } from '~/composables/useInternalEventTracking'
import { extractCollectionFromPayload } from '~/utils/admin/extractCollectionFromPayload'

type UserRecord = {
  id: string
  username: string
  firstName: string
  lastName: string
  email: string
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

const createOpen = ref(false)
const creating = ref(false)
const createForm = reactive({
  username: '',
  email: '',
  firstName: '',
  lastName: '',
  password: '',
})

const columns: DataTableHeader[] = [
  { title: 'Username', key: 'username' },
  { title: 'First name', key: 'firstName' },
  { title: 'Last name', key: 'lastName' },
  { title: 'Email', key: 'email' },
]

function normalize(payload: unknown): UserRecord[] {
  return extractCollectionFromPayload(payload).map((entry, index) => {
    const row = entry as Record<string, unknown>

    return {
      id: String(row.id ?? row.uuid ?? index),
      username: String(row.username ?? ''),
      firstName: String(row.firstName ?? ''),
      lastName: String(row.lastName ?? ''),
      email: String(row.email ?? ''),
    }
  })
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
  const order = activeSort && activeSort.order && activeSort.order !== false
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
    if (String(row.password ?? '').trim().length < 8) {
      Notify.error('Le mot de passe est requis (8 caractères minimum).')
      return
    }

    try {
      await $fetch(
        `/api/user/${encodeURIComponent(String(row.id ?? ''))}` as any,
        {
          method: 'PATCH' as any,
          body: {
            username: row.username,
            email: row.email,
            firstName: row.firstName,
            lastName: row.lastName,
            password: row.password,
          },
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
      :detail-fields="[
        { key: 'username', label: 'Username' },
        { key: 'firstName', label: 'First name' },
        { key: 'lastName', label: 'Last name' },
        { key: 'email', label: 'Email' },
      ]"
      :editable-fields="[
        { key: 'username', label: 'Username' },
        { key: 'firstName', label: 'First name' },
        { key: 'lastName', label: 'Last name' },
        { key: 'email', label: 'Email' },
      ]"
      :can-show="canShow"
      :can-create="canCreate"
      :can-edit="canEdit"
      :can-delete="canDelete"
      :mutation-loading="mutationLoading"
      resource-name="l'utilisateur"
      detail-route-base="/administration/users"
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
