<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { Notify } from '~/stores/notification'
import { isRoot } from '~/utils/permissions/admin'
import { useAuthStore } from '~/stores/auth'
import { toUiErrorMessage } from '~/utils/errors/toUiErrorMessage'
import { useRelationField } from '~/composables/admin/useRelationField'

definePageMeta({
  icon: 'mdi-account-details-outline',
  title: 'Détails utilisateur',
  drawerIndex: 72,
  requiresAuth: true,
  requiresAdmin: true,
  middleware: ['auth', 'admin-access'],
  adminPermission: 'manageUsers',
})

type UserProfile = {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
}

type UserGroup = {
  id: string
  name: string
}

const { t } = useI18n()
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
const selectedGroupId = ref('')

const userGroupsRelation = useRelationField<UserGroup>({
  fieldName: 'userGroups',
  fieldEndpoint: '/api/v1/admin/user-groups',
  parentEndpoint: () => `/api/user/${encodeURIComponent(userId.value)}`,
  relationEndpoint: relationId => `/api/user/${encodeURIComponent(userId.value)}/group/${encodeURIComponent(relationId)}`,
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

const userGroups = userGroupsRelation.relationItems
const groupOptionsLoading = computed(() => userGroupsRelation.loadingOptions.value)


const canManageGroups = computed(() => isRoot(roles.value))
const canManageProfile = computed(() => isRoot(roles.value))

const availableGroupOptions = computed(() => {
  return userGroupsRelation.availableOptions.value.map(option => ({
    title: option.label,
    value: option.id,
  }))
})

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
    firstName: String(row.firstName ?? ''),
    lastName: String(row.lastName ?? ''),
  }
}

async function saveProfile() {
  if (!userProfile.value || !canManageProfile.value) {
    return
  }

  busyAction.value = true

  try {
    await $fetch(`/api/user/${encodeURIComponent(userId.value)}`, {
      method: 'PUT',
      body: {
        username: userProfile.value.username.trim(),
        email: userProfile.value.email.trim(),
        firstName: userProfile.value.firstName.trim(),
        lastName: userProfile.value.lastName.trim(),
      },
    })

    Notify.success(String(useNuxtApp().$i18n.t('notifications.ui.userProfileUpdated')))
    await loadUserData()
  } catch (error) {
    Notify.error(toUiErrorMessage(error))
  } finally {
    busyAction.value = false
  }
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
    userGroups.value = userGroupsRelation.normalizeItems(groupsResponse)
  } catch (error) {
    Notify.error(toUiErrorMessage(error))
  } finally {
    loading.value = false
  }
}

async function attachGroup() {
  const groupId = selectedGroupId.value.trim()

  if (!groupId) {
    return
  }

  if (!canManageGroups.value) {
    Notify.error(String(useNuxtApp().$i18n.t('notifications.ui.rootOnlyAction')))
    return
  }

  busyAction.value = true

  try {
    await userGroupsRelation.addRelation(groupId)

    Notify.success(String(useNuxtApp().$i18n.t('notifications.ui.groupAttachedUser')))
    selectedGroupId.value = ''
    await loadUserData()
  } catch (error) {
    Notify.error(toUiErrorMessage(error))
  } finally {
    busyAction.value = false
  }
}

async function detachGroup(groupId: string) {
  if (!canManageGroups.value) {
    Notify.error(String(useNuxtApp().$i18n.t('notifications.ui.rootOnlyAction')))
    return
  }

  busyAction.value = true

  try {
    await userGroupsRelation.removeRelation(groupId)

    Notify.success(String(useNuxtApp().$i18n.t('notifications.ui.groupDetachedUser')))
    await loadUserData()
  } catch (error) {
    Notify.error(toUiErrorMessage(error))
  } finally {
    busyAction.value = false
  }
}

onMounted(async () => {
  await authStore.ensureRolesLoaded()
  await Promise.all([loadUserData(), userGroupsRelation.loadOptions()])
})
</script>

<template>
  <v-container fluid class="pa-6">
    <v-card rounded="xl" elevation="6" class="pa-6">
      <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-4">
        <h1 class="text-h4 font-weight-bold">{{ t('adminUsers.heading', { id: userId }) }}</h1>
        <v-btn variant="text" prepend-icon="mdi-arrow-left" to="/admin/user-management/users">
          Retour à la liste
        </v-btn>
      </div>

      <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

      <v-tabs v-model="activeTab" color="primary" class="mb-3">
        <v-tab value="profile">{{ t('adminUsers.tabs.profile') }}</v-tab>
        <v-tab value="roles">{{ t('adminUsers.tabs.roles') }}</v-tab>
        <v-tab value="groups">{{ t('adminUsers.tabs.groups') }}</v-tab>
      </v-tabs>

      <v-window v-model="activeTab">
        <v-window-item value="profile">
          <v-card v-if="userProfile" variant="tonal" rounded="lg" class="pa-4">
            <v-text-field :model-value="userProfile?.id ?? userId" :label="t('adminUsers.fields.id')" disabled class="mb-2" />
            <v-text-field v-model="userProfile.username" :label="t('adminUsers.fields.username')" :disabled="!canManageProfile || busyAction" class="mb-2" />
            <v-text-field v-model="userProfile.email" :label="t('adminUsers.fields.email')" :disabled="!canManageProfile || busyAction" class="mb-2" />
            <v-text-field v-model="userProfile.firstName" :label="t('adminUsers.fields.firstName')" :disabled="!canManageProfile || busyAction" class="mb-2" />
            <v-text-field v-model="userProfile.lastName" :label="t('adminUsers.fields.lastName')" :disabled="!canManageProfile || busyAction" />

            <div class="d-flex justify-end mt-2">
              <v-btn color="primary" :loading="busyAction" :disabled="!canManageProfile || !userProfile" @click="saveProfile">
                Enregistrer
              </v-btn>
            </div>
          </v-card>
          <v-alert v-else type="warning" variant="tonal">Utilisateur introuvable.</v-alert>
        </v-window-item>

        <v-window-item value="roles">
          <v-card variant="tonal" rounded="lg" class="pa-4">
            <div class="text-subtitle-1 mb-2">Rôles utilisateur</div>
            <div v-if="userRoles.length === 0" class="text-medium-emphasis">Aucun rôle.</div>
            <v-list v-else density="comfortable" lines="one" class="bg-transparent pa-0">
              <v-list-item
                v-for="roleName in userRoles"
                :key="roleName"
                class="px-0"
              >
                <template #prepend>
                  <v-icon icon="mdi-shield-account-outline" size="18" class="mr-2" />
                </template>
                <v-list-item-title>{{ roleName }}</v-list-item-title>
              </v-list-item>
            </v-list>
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
            <v-list v-else density="comfortable" lines="one" class="bg-transparent pa-0 mb-4">
              <v-list-item
                v-for="group in userGroups"
                :key="group.id"
                class="px-0"
              >
                <template #prepend>
                  <v-icon icon="mdi-account-group" size="18" class="mr-2" />
                </template>
                <v-list-item-title>{{ group.name }}</v-list-item-title>
                <template #append>
                  <v-btn
                    v-if="canManageGroups"
                    size="small"
                    variant="text"
                    color="error"
                    icon="mdi-close"
                    :disabled="busyAction"
                    @click="detachGroup(group.id)"
                  />
                </template>
              </v-list-item>
            </v-list>

            <v-row dense>
              <v-col cols="12" md="8">
                <v-select
                  v-model="selectedGroupId"
                  :label="t('adminUsers.addGroup')"
                  prepend-inner-icon="mdi-account-group"
                  :items="availableGroupOptions"
                  item-title="title"
                  item-value="value"
                  hide-details
                  density="comfortable"
                  :loading="groupOptionsLoading"
                  :disabled="!canManageGroups || busyAction"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-btn
                  block
                  color="primary"
                  :loading="busyAction"
                  :disabled="!canManageGroups || !selectedGroupId"
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
