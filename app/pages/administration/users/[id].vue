<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { Notify } from '~/stores/notification'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  icon: 'mdi-account-details-outline',
  title: 'User details',
  drawerIndex: 72,
  requiresAuth: true,
  requiresAdmin: true,
  middleware: ['auth', 'admin-access'],
})

type UserProfile = {
  id: string
  username: string
  email: string
}

const route = useRoute()
const authStore = useAuthStore()
const { roles } = storeToRefs(authStore)

const userId = computed(() => {
  const paramId = (route.params as Record<string, unknown>).id
  return Array.isArray(paramId) ? String(paramId[0] ?? '') : String(paramId ?? '')
})
const loading = ref(false)
const busyAction = ref(false)
const activeTab = ref('profile')
const userProfile = ref<UserProfile | null>(null)
const userRoles = ref<string[]>([])
const userGroups = ref<string[]>([])
const newGroup = ref('')

const canManageGroups = computed(() => roles.value.includes('ROLE_ROOT'))

function normalizeStringList(payload: unknown): string[] {
  const records = Array.isArray(payload)
    ? payload
    : payload && typeof payload === 'object' && Array.isArray((payload as { items?: unknown[] }).items)
      ? (payload as { items: unknown[] }).items
      : payload && typeof payload === 'object' && Array.isArray((payload as { data?: unknown[] }).data)
        ? (payload as { data: unknown[] }).data
        : []

  return records.map((entry) => {
    if (typeof entry === 'string') {
      return entry
    }

    if (entry && typeof entry === 'object') {
      const row = entry as Record<string, unknown>
      return String(row.name ?? row.id ?? row.code ?? '')
    }

    return String(entry ?? '')
  }).filter(Boolean)
}

function normalizeProfile(payload: unknown): UserProfile {
  const row = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {}

  return {
    id: String(row.id ?? userId.value),
    username: String(row.username ?? row.userName ?? '-'),
    email: String(row.email ?? '-'),
  }
}

function toErrorMessage(error: unknown): string {
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

async function loadUserData() {
  if (!userId.value) {
    return
  }

  loading.value = true

  try {
    const [profileResponse, rolesResponse, groupsResponse] = await Promise.all([
      $fetch(`/api/user/${encodeURIComponent(userId.value)}`),
      $fetch(`/api/user/${encodeURIComponent(userId.value)}/roles`),
      $fetch(`/api/user/${encodeURIComponent(userId.value)}/groups`),
    ])

    userProfile.value = normalizeProfile(profileResponse)
    userRoles.value = normalizeStringList(rolesResponse)
    userGroups.value = normalizeStringList(groupsResponse)
  } catch (error) {
    Notify.error(toErrorMessage(error))
  } finally {
    loading.value = false
  }
}

async function attachGroup() {
  const groupValue = newGroup.value.trim()

  if (!groupValue) {
    return
  }

  if (!canManageGroups.value) {
    Notify.error('Action réservée aux utilisateurs ROLE_ROOT.')
    return
  }

  busyAction.value = true

  try {
    await $fetch(`/api/user/${encodeURIComponent(userId.value)}/group/${encodeURIComponent(groupValue)}`, {
      method: 'POST',
    })

    Notify.success(`Groupe ${groupValue} attaché.`)
    newGroup.value = ''
    await loadUserData()
  } catch (error) {
    Notify.error(toErrorMessage(error))
  } finally {
    busyAction.value = false
  }
}

async function detachGroup(groupName: string) {
  if (!canManageGroups.value) {
    Notify.error('Action réservée aux utilisateurs ROLE_ROOT.')
    return
  }

  busyAction.value = true

  try {
    await $fetch(`/api/user/${encodeURIComponent(userId.value)}/group/${encodeURIComponent(groupName)}`, {
      method: 'DELETE',
    })

    Notify.success(`Groupe ${groupName} retiré.`)
    await loadUserData()
  } catch (error) {
    Notify.error(toErrorMessage(error))
  } finally {
    busyAction.value = false
  }
}

onMounted(async () => {
  await authStore.ensureRolesLoaded()
  await loadUserData()
})
</script>

<template>
  <v-container fluid class="pa-6">
    <v-card rounded="xl" elevation="6" class="pa-6">
      <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-4">
        <h1 class="text-h4 font-weight-bold">Administration · User {{ userId }}</h1>
        <v-btn variant="text" prepend-icon="mdi-arrow-left" to="/administration/users">
          Retour à la liste
        </v-btn>
      </div>

      <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

      <v-tabs v-model="activeTab" color="primary" class="mb-3">
        <v-tab value="profile">Profile</v-tab>
        <v-tab value="roles">Roles</v-tab>
        <v-tab value="groups">Groups</v-tab>
      </v-tabs>

      <v-window v-model="activeTab">
        <v-window-item value="profile">
          <v-card variant="tonal" rounded="lg" class="pa-4">
            <div><strong>ID:</strong> {{ userProfile?.id ?? userId }}</div>
            <div><strong>Username:</strong> {{ userProfile?.username ?? '-' }}</div>
            <div><strong>Email:</strong> {{ userProfile?.email ?? '-' }}</div>
          </v-card>
        </v-window-item>

        <v-window-item value="roles">
          <v-card variant="tonal" rounded="lg" class="pa-4">
            <div class="text-subtitle-1 mb-2">Rôles utilisateur</div>
            <div v-if="userRoles.length === 0" class="text-medium-emphasis">Aucun rôle.</div>
            <div v-else class="d-flex flex-wrap ga-2">
              <v-chip
                v-for="roleName in userRoles"
                :key="roleName"
                size="small"
                color="primary"
                variant="flat"
              >
                {{ roleName }}
              </v-chip>
            </div>
          </v-card>
        </v-window-item>

        <v-window-item value="groups">
          <v-card variant="tonal" rounded="lg" class="pa-4">
            <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-3">
              <div class="text-subtitle-1">Groupes utilisateur</div>
              <v-chip :color="canManageGroups ? 'success' : 'warning'" size="small" variant="tonal">
                {{ canManageGroups ? 'Modification autorisée (ROOT)' : 'Lecture seule (ADMIN)' }}
              </v-chip>
            </div>

            <div v-if="userGroups.length === 0" class="text-medium-emphasis mb-3">Aucun groupe.</div>
            <div v-else class="d-flex flex-wrap ga-2 mb-4">
              <v-chip
                v-for="groupName in userGroups"
                :key="groupName"
                size="small"
                color="secondary"
                variant="flat"
                :append-icon="canManageGroups ? 'mdi-close' : undefined"
                :disabled="busyAction"
                @click:append="detachGroup(groupName)"
              >
                {{ groupName }}
              </v-chip>
            </div>

            <v-row dense>
              <v-col cols="12" md="8">
                <v-text-field
                  v-model="newGroup"
                  label="Ajouter un groupe (id ou nom)"
                  prepend-inner-icon="mdi-account-group"
                  hide-details
                  density="comfortable"
                  :disabled="!canManageGroups || busyAction"
                  @keydown.enter.prevent="attachGroup"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-btn
                  block
                  color="primary"
                  :loading="busyAction"
                  :disabled="!canManageGroups || !newGroup.trim()"
                  @click="attachGroup"
                >
                  Attacher
                </v-btn>
              </v-col>
            </v-row>
          </v-card>
        </v-window-item>
      </v-window>
    </v-card>
  </v-container>
</template>
