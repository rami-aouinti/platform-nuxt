<script setup lang="ts">
import { FORBIDDEN_MESSAGE } from '~/utils/permissions/messages'
import type { DataTableHeader } from 'vuetify'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import { Notify } from '~/stores/notification'
import { isRoot } from '~/utils/permissions/admin'

type UserGroupRecord = {
  id: string
  name: string
  description: string
}

definePageMeta({
  icon: 'mdi-account-group-outline',
  title: 'User groups',
  drawerIndex: 73,
  requiresAuth: true,
  requiresAdmin: true,
  middleware: ['auth', 'admin-access'],
  adminPermission: 'manageUsers',
})

const authStore = useAuthStore()
const { roles } = storeToRefs(authStore)

const loading = ref(false)
const saving = ref(false)
const apiError = ref<string | null>(null)
const groups = ref<UserGroupRecord[]>([])
const totalGroups = ref(0)
const availableIds = ref<string[]>([])

const page = ref(1)
const itemsPerPage = ref(10)
const search = ref('')

const createDialog = ref(false)
const editDialog = ref(false)
const editGroup = ref<UserGroupRecord | null>(null)
const newGroup = reactive({
  id: '',
  name: '',
  description: '',
})

const headers: DataTableHeader[] = [
  { title: 'ID', key: 'id' },
  { title: 'Nom', key: 'name' },
  { title: 'Description', key: 'description' },
  { title: 'Actions', key: 'actions', sortable: false },
]

const canManage = computed(() => isRoot(roles.value))
const manageDisabledMessage = 'Action réservée aux utilisateurs ROLE_ROOT.'

function normalizeGroups(payload: unknown): UserGroupRecord[] {
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

  return records.map((entry, index) => {
    const row = entry as Record<string, unknown>

    return {
      id: String(row.id ?? row.uuid ?? row.name ?? index),
      name: String(row.name ?? row.label ?? row.id ?? ''),
      description: String(row.description ?? row.comment ?? ''),
    }
  })
}

function toErrorMessage(error: unknown): string {
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

function cleanBody(group: UserGroupRecord | typeof newGroup) {
  const payload = {
    id: group.id.trim(),
    name: group.name.trim(),
    description: group.description.trim(),
  }

  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value.length > 0),
  )
}

async function loadGroups() {
  loading.value = true
  apiError.value = null

  try {
    const query = {
      page: page.value,
      limit: itemsPerPage.value,
      search: search.value || undefined,
    }

    const [listResponse, countResponse, idsResponse] = await Promise.all([
      $fetch('/api/user_group', { query }),
      $fetch('/api/user_group/count'),
      $fetch('/api/user_group/ids'),
    ])

    groups.value = normalizeGroups(listResponse)
    totalGroups.value =
      typeof countResponse === 'number'
        ? countResponse
        : Number(
            (countResponse as { count?: number })?.count ?? groups.value.length,
          )

    availableIds.value = Array.isArray(idsResponse)
      ? idsResponse.map(String)
      : []
  } catch (error) {
    apiError.value = toErrorMessage(error)
    Notify.error(apiError.value)
  } finally {
    loading.value = false
  }
}

function openCreateDialog() {
  newGroup.id = ''
  newGroup.name = ''
  newGroup.description = ''
  createDialog.value = true
}

async function createGroup() {
  if (!canManage.value) {
    Notify.error('Action réservée aux utilisateurs ROLE_ROOT.')
    return
  }

  saving.value = true

  try {
    await $fetch('/api/user_group', {
      method: 'POST' as any,
      body: cleanBody(newGroup),
    })

    Notify.success('Groupe créé.')
    createDialog.value = false
    await loadGroups()
  } catch (error) {
    Notify.error(toErrorMessage(error))
  } finally {
    saving.value = false
  }
}

function openEditDialog(group: UserGroupRecord) {
  editGroup.value = { ...group }
  editDialog.value = true
}

async function saveEdit() {
  if (!editGroup.value) {
    return
  }

  saving.value = true

  try {
    await $fetch(`/api/user_group/${encodeURIComponent(editGroup.value.id)}`, {
      method: 'PATCH' as any,
      body: cleanBody(editGroup.value),
    })

    Notify.success('Groupe mis à jour.')
    editDialog.value = false
    await loadGroups()
  } catch (error) {
    Notify.error(toErrorMessage(error))
  } finally {
    saving.value = false
  }
}

const dialogDelete = useTemplateRef('dialogDelete')

async function deleteGroup(group: UserGroupRecord) {
  if (!canManage.value) {
    Notify.error('Action réservée aux utilisateurs ROLE_ROOT.')
    return
  }

  const confirmed = await dialogDelete.value?.open(
    `Supprimer le groupe ${group.name || group.id} ?`,
  )

  if (!confirmed) {
    return
  }

  try {
    await $fetch(`/api/user_group/${encodeURIComponent(group.id)}`, {
      method: 'DELETE' as any,
    })

    Notify.success('Groupe supprimé.')
    await loadGroups()
  } catch (error) {
    Notify.error(toErrorMessage(error))
  }
}

watch([page, itemsPerPage], async () => {
  await loadGroups()
})

watchDebounced(
  search,
  async () => {
    page.value = 1
    await loadGroups()
  },
  { debounce: 350, maxWait: 1200 },
)

onMounted(async () => {
  await authStore.ensureRolesLoaded()
  await loadGroups()
})
</script>

<template>
  <v-container fluid class="pa-6">
    <v-card rounded="xl" elevation="6" class="pa-6">
      <div
        class="d-flex flex-wrap justify-space-between align-center ga-4 mb-4"
      >
        <h1 class="text-h4 font-weight-bold">Administration · User groups</h1>
        <div class="d-flex align-center ga-2 flex-wrap">
          <div class="text-caption text-medium-emphasis">
            Total: {{ totalGroups }} · IDs reçus: {{ availableIds.length }}
          </div>
          <v-tooltip :text="manageDisabledMessage" :disabled="canManage">
            <template #activator="{ props: tooltipProps }">
              <span v-bind="tooltipProps">
                <v-btn
                  color="primary"
                  prepend-icon="mdi-plus"
                  :disabled="!canManage"
                  @click="openCreateDialog"
                >
                  Créer
                </v-btn>
              </span>
            </template>
          </v-tooltip>
        </div>
      </div>

      <AdminPageError :message="apiError" />

      <v-text-field
        v-model="search"
        label="Recherche"
        prepend-inner-icon="mdi-magnify"
        density="comfortable"
        hide-details
        clearable
        class="mb-4"
      />

      <v-data-table-server
        v-model:page="page"
        v-model:items-per-page="itemsPerPage"
        :headers="headers"
        :items="groups"
        :items-length="totalGroups"
        :loading="loading"
        item-value="id"
      >
        <template #item.actions="{ item }">
          <div class="d-flex ga-1">
            <v-btn
              size="small"
              icon="mdi-eye-outline"
              variant="text"
              color="info"
              :to="`/administration/user-groups/${item.id}`"
            />
            <v-tooltip :text="manageDisabledMessage" :disabled="canManage">
              <template #activator="{ props: tooltipProps }">
                <span v-bind="tooltipProps">
                  <v-btn
                    size="small"
                    icon="mdi-pencil-outline"
                    variant="text"
                    color="warning"
                    :disabled="!canManage"
                    @click="openEditDialog(item)"
                  />
                </span>
              </template>
            </v-tooltip>
            <v-tooltip :text="manageDisabledMessage" :disabled="canManage">
              <template #activator="{ props: tooltipProps }">
                <span v-bind="tooltipProps">
                  <v-btn
                    size="small"
                    icon="mdi-delete-outline"
                    variant="text"
                    color="error"
                    :disabled="!canManage"
                    @click="deleteGroup(item)"
                  />
                </span>
              </template>
            </v-tooltip>
          </div>
        </template>
      </v-data-table-server>
    </v-card>

    <DialogConfirm ref="dialogDelete" />

    <v-dialog v-model="createDialog" max-width="640">
      <v-card>
        <v-card-title>Créer un groupe</v-card-title>
        <v-card-text class="pt-4">
          <v-text-field v-model="newGroup.id" label="ID" class="mb-2" />
          <v-text-field v-model="newGroup.name" label="Nom" class="mb-2" />
          <v-textarea
            v-model="newGroup.description"
            label="Description"
            rows="3"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="createDialog = false">Annuler</v-btn>
          <v-btn color="primary" :loading="saving" @click="createGroup"
            >Créer</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="editDialog" max-width="640">
      <v-card v-if="editGroup">
        <v-card-title>Éditer le groupe</v-card-title>
        <v-card-text class="pt-4">
          <v-text-field
            v-model="editGroup.id"
            label="ID"
            class="mb-2"
            disabled
          />
          <v-text-field v-model="editGroup.name" label="Nom" class="mb-2" />
          <v-textarea
            v-model="editGroup.description"
            label="Description"
            rows="3"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="editDialog = false">Annuler</v-btn>
          <v-btn color="primary" :loading="saving" @click="saveEdit"
            >Enregistrer</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
