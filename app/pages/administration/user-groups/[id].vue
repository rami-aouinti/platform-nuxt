<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { Notify } from '~/stores/notification'
import { isRoot } from '~/utils/permissions/admin'
import { useAuthStore } from '~/stores/auth'
import { toUiErrorMessage } from '~/utils/errors/toUiErrorMessage'

type UserGroupProfile = {
  id: string
  name: string
  description: string
}

type GroupUser = {
  id: string
  username: string
  email: string
}

definePageMeta({
  icon: 'mdi-account-group-outline',
  title: 'User group details',
  drawerIndex: 74,
  requiresAuth: true,
  requiresAdmin: true,
  middleware: ['auth', 'admin-access'],
  adminPermission: 'manageUsers',
})

const route = useRoute()
const authStore = useAuthStore()
const { roles } = storeToRefs(authStore)

const groupId = computed(() => {
  const paramId = (route.params as Record<string, unknown>).id
  return Array.isArray(paramId) ? String(paramId[0] ?? '') : String(paramId ?? '')
})

const loading = ref(false)
const saving = ref(false)
const group = ref<UserGroupProfile | null>(null)
const users = ref<GroupUser[]>([])
const newUserId = ref('')

const canManage = computed(() => isRoot(roles.value))

function normalizeGroup(payload: unknown): UserGroupProfile {
  const row = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {}

  return {
    id: String(row.id ?? groupId.value),
    name: String(row.name ?? row.label ?? row.id ?? '-'),
    description: String(row.description ?? row.comment ?? ''),
  }
}

function normalizeUsers(payload: unknown): GroupUser[] {
  const records = Array.isArray(payload)
    ? payload
    : payload && typeof payload === 'object' && Array.isArray((payload as { items?: unknown[] }).items)
      ? (payload as { items: unknown[] }).items
      : payload && typeof payload === 'object' && Array.isArray((payload as { data?: unknown[] }).data)
        ? (payload as { data: unknown[] }).data
        : []

  return records.map((entry, index) => {
    const row = entry as Record<string, unknown>

    return {
      id: String(row.id ?? row.uuid ?? index),
      username: String(row.username ?? row.userName ?? row.id ?? '-'),
      email: String(row.email ?? ''),
    }
  })
}


async function loadGroupData() {
  if (!groupId.value) {
    return
  }

  loading.value = true

  try {
    const [groupResponse, usersResponse] = await Promise.all([
      $fetch(`/api/user_group/${encodeURIComponent(groupId.value)}`),
      $fetch(`/api/user_group/${encodeURIComponent(groupId.value)}/users`),
    ])

    group.value = normalizeGroup(groupResponse)
    users.value = normalizeUsers(usersResponse)
  } catch (error) {
    Notify.error(toUiErrorMessage(error))
  } finally {
    loading.value = false
  }
}

async function saveGroup() {
  if (!group.value || !canManage.value) {
    return
  }

  saving.value = true

  try {
    await $fetch(`/api/user_group/${encodeURIComponent(group.value.id)}`, {
      method: 'PUT' as any,
      body: {
        name: group.value.name.trim(),
        description: group.value.description.trim(),
      },
    })

    Notify.success('Groupe mis à jour.')
    await loadGroupData()
  } catch (error) {
    Notify.error(toUiErrorMessage(error))
  } finally {
    saving.value = false
  }
}

const dialogAttach = useTemplateRef('dialogAttach')
const dialogDetach = useTemplateRef('dialogDetach')

async function attachUser() {
  const userValue = newUserId.value.trim()

  if (!userValue) {
    return
  }

  if (!canManage.value) {
    Notify.error('Action réservée aux utilisateurs ROLE_ROOT.')
    return
  }

  const confirmed = await dialogAttach.value?.open(
    `Attacher l’utilisateur ${userValue} au groupe ${group.value?.name || groupId} ?`,
  )

  if (!confirmed) {
    return
  }

  saving.value = true

  try {
    await $fetch(`/api/user_group/${encodeURIComponent(groupId.value)}/user/${encodeURIComponent(userValue)}`, {
      method: 'POST' as any,
    })

    Notify.success(`Utilisateur ${userValue} attaché.`)
    newUserId.value = ''
    await loadGroupData()
  } catch (error) {
    Notify.error(toUiErrorMessage(error))
  } finally {
    saving.value = false
  }
}

async function detachUser(user: GroupUser) {
  if (!canManage.value) {
    Notify.error('Action réservée aux utilisateurs ROLE_ROOT.')
    return
  }

  const confirmed = await dialogDetach.value?.open(
    `Retirer l’utilisateur ${user.username || user.id} du groupe ${group.value?.name || groupId} ?`,
  )

  if (!confirmed) {
    return
  }

  saving.value = true

  try {
    await $fetch(`/api/user_group/${encodeURIComponent(groupId.value)}/user/${encodeURIComponent(user.id)}`, {
      method: 'DELETE' as any,
    })

    Notify.success(`Utilisateur ${user.username || user.id} retiré.`)
    await loadGroupData()
  } catch (error) {
    Notify.error(toUiErrorMessage(error))
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await authStore.ensureRolesLoaded()
  await loadGroupData()
})
</script>

<template>
  <v-container fluid class="pa-6">
    <v-card rounded="xl" elevation="6" class="pa-6">
      <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-4">
        <h1 class="text-h4 font-weight-bold">Administration · User group {{ groupId }}</h1>
        <v-btn variant="text" prepend-icon="mdi-arrow-left" to="/administration/user-groups">
          Retour à la liste
        </v-btn>
      </div>

      <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

      <v-card v-if="group" variant="tonal" rounded="lg" class="pa-4 mb-4">
        <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-3">
          <div class="text-subtitle-1">Profil du groupe</div>
          <v-chip :color="canManage ? 'success' : 'warning'" size="small" variant="tonal">
            {{ canManage ? 'Modification autorisée (ROOT)' : 'Lecture seule (ADMIN)' }}
          </v-chip>
        </div>

        <v-text-field v-model="group.id" label="ID" class="mb-2" disabled />
        <v-text-field v-model="group.name" label="Nom" class="mb-2" :disabled="!canManage || saving" />
        <v-textarea
          v-model="group.description"
          label="Description"
          rows="3"
          :disabled="!canManage || saving"
        />

        <div class="d-flex justify-end mt-2">
          <v-btn color="primary" :loading="saving" :disabled="!canManage" @click="saveGroup">
            Enregistrer
          </v-btn>
        </div>
      </v-card>

      <v-alert v-else type="warning" variant="tonal" density="comfortable" class="mb-4">
        Groupe introuvable.
      </v-alert>

      <v-card variant="tonal" rounded="lg" class="pa-4">
        <div class="text-subtitle-1 mb-3">Membres ({{ users.length }})</div>

        <div v-if="users.length === 0" class="text-medium-emphasis mb-3">Aucun membre.</div>

        <v-list v-else density="comfortable" class="mb-4 bg-transparent">
          <v-list-item v-for="user in users" :key="user.id" :title="user.username" :subtitle="user.email || user.id">
            <template #append>
              <v-btn
                icon="mdi-account-remove-outline"
                color="error"
                variant="text"
                size="small"
                :disabled="!canManage || saving"
                @click="detachUser(user)"
              />
            </template>
          </v-list-item>
        </v-list>

        <v-row dense>
          <v-col cols="12" md="8">
            <v-text-field
              v-model="newUserId"
              label="Ajouter un utilisateur (id)"
              prepend-inner-icon="mdi-account-plus-outline"
              hide-details
              density="comfortable"
              :disabled="!canManage || saving"
              @keydown.enter.prevent="attachUser"
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-btn
              block
              color="primary"
              :loading="saving"
              :disabled="!canManage || !newUserId.trim()"
              @click="attachUser"
            >
              Attacher
            </v-btn>
          </v-col>
        </v-row>
      </v-card>
    </v-card>

    <DialogConfirm ref="dialogAttach" />
    <DialogConfirm ref="dialogDetach" />
  </v-container>
</template>
