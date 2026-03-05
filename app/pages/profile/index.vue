<script setup lang="ts">
import { storeToRefs } from 'pinia'
import type { Component } from 'vue'
import { markRaw } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useProfileCompaniesStore } from '~/stores/profileCompanies'
import { apiEndpoints } from '~/services/api/endpoints'
import imageKalVisualsSquare from '~/assets/img/kal-visuals-square.jpg'
import imageMarie from '~/assets/img/marie.jpg'
import imageIvanaSquare from '~/assets/img/ivana-square.jpg'
import imageTeam4 from '~/assets/img/team-4.jpg'
import imageTeam3 from '~/assets/img/team-3.jpg'
import BasicInfoTab from '~/components/profile/tabs/BasicInfoTab.vue'
import AccountsTab from '~/components/profile/tabs/AccountsTab.vue'
import ChangePasswordTab from '~/components/profile/tabs/ChangePasswordTab.vue'
import TwoFactorAuthTab from '~/components/profile/tabs/TwoFactorAuthTab.vue'
import NotificationsTab from '~/components/profile/tabs/NotificationsTab.vue'
import SessionsTab from '~/components/profile/tabs/SessionsTab.vue'
import DeleteAccountTab from '~/components/profile/tabs/DeleteAccountTab.vue'
import ResumesTab from '~/components/profile/tabs/ResumesTab.vue'
import FriendsTab from '~/components/profile/tabs/FriendsTab.vue'
import MediaTab from '~/components/profile/tabs/MediaTab.vue'

definePageMeta({
  icon: 'mdi-account-circle-outline',
  title: 'Profile',
  middleware: 'auth',
  requiresAuth: true,
})

type ToggleItem = {
  text: string
  enabled: boolean
}

type SocialAccount = {
  provider?: string
  username?: string
  email?: string
}

const { t } = useI18n()
const auth = useAuthStore()
const profileCompaniesStore = useProfileCompaniesStore()
const { isAuthenticated, profile, roles, groups } = storeToRefs(auth)
const {
  list: companies,
  loading: companiesLoading,
  error: companiesError,
  schema: companySchema,
  schemaLoading: companySchemaLoading,
  schemaError: companySchemaError,
  usesSchemaFallback,
} = storeToRefs(profileCompaniesStore)
const route = useRoute()

const isLoading = ref(false)
const errorMessage = ref<string | null>(null)
const socialAccounts = ref<SocialAccount[]>([])

const createCompanyForm = ref({
  name: '',
  role: '',
  description: '',
})
const creatingCompany = ref(false)
const showCreateCompanyModal = ref(false)

const companySchemaFields = computed(() => {
  const schemaProperties = companySchema.value?.properties ?? {}

  return ['name', 'role', 'description'].map((key) => {
    const property = schemaProperties[key]
    return {
      key,
      label:
        typeof property?.title === 'string'
          ? property.title
          : key === 'name'
            ? 'Nom de la société'
            : key === 'role'
              ? 'Rôle'
              : 'Description',
      required: companySchema.value?.required?.includes(key) ?? key === 'name',
    }
  })
})

function getCompanyFieldMeta(key: 'name' | 'role' | 'description') {
  return companySchemaFields.value.find((field) => field.key === key)
}

const accountSettings = ref<ToggleItem[]>([
  { enabled: true, text: t('profile.settings.account.follow') },
  { enabled: false, text: t('profile.settings.account.answers') },
  { enabled: true, text: t('profile.settings.account.mentions') },
])

const applicationSettings = ref<ToggleItem[]>([
  { enabled: false, text: t('profile.settings.application.launches') },
  { enabled: true, text: t('profile.settings.application.updates') },
  { enabled: false, text: t('profile.settings.application.newsletter') },
])

const conversationFallback = [
  {
    avatar: imageKalVisualsSquare,
    user: 'Sophie B.',
    message: 'Hi! I need more information..',
  },
  {
    avatar: imageMarie,
    user: 'Anne Marie',
    message: 'Awesome work, can you..',
  },
  { avatar: imageIvanaSquare, user: 'Ivanna', message: 'About files I can..' },
  { avatar: imageTeam4, user: 'Peterson', message: 'Have a great afternoon..' },
  {
    avatar: imageTeam3,
    user: 'Nick Daniel',
    message: 'Hi! I need more information..',
  },
]

type TabDefinition = {
  id: string
  icon: string
  labelKey: string
  description?: string
  component?: Component
}

type MenuItem = {
  id: string
  icon: string
  label: string
  tabId: string
}

const activeTab = ref('overview')
const isSyncingTabWithRoute = ref(false)

const tabDefinitions: TabDefinition[] = [
  { id: 'overview', icon: 'mdi-person', labelKey: 'profile.tabs.overview' },
  {
    id: 'basic-info',
    icon: 'mdi-receipt',
    labelKey: 'profile.tabs.basicInfo',
    description: t('profile.tabDescriptions.basicInfo'),
    component: markRaw(BasicInfoTab),
  },
  {
    id: 'change-password',
    icon: 'mdi-lock',
    labelKey: 'profile.tabs.changePassword',
    description: t('profile.tabDescriptions.changePassword'),
    component: markRaw(ChangePasswordTab),
  },
  {
    id: 'two-factor-auth',
    icon: 'mdi-security',
    labelKey: 'profile.tabs.twoFactorAuth',
    description: t('profile.tabDescriptions.twoFactorAuth'),
    component: markRaw(TwoFactorAuthTab),
  },
  {
    id: 'accounts',
    icon: 'mdi-clipboard-account',
    labelKey: 'profile.tabs.accounts',
    description: t('profile.tabDescriptions.accounts'),
    component: markRaw(AccountsTab),
  },
  {
    id: 'notifications',
    icon: 'mdi-bell',
    labelKey: 'profile.tabs.notifications',
    description: t('profile.tabDescriptions.notifications'),
    component: markRaw(NotificationsTab),
  },
  {
    id: 'sessions',
    icon: 'mdi-settings',
    labelKey: 'profile.tabs.sessions',
    description: t('profile.tabDescriptions.sessions'),
    component: markRaw(SessionsTab),
  },
  {
    id: 'resumes',
    icon: 'mdi-note-text-outline',
    labelKey: 'profile.resumes',
    component: markRaw(ResumesTab),
  },
  {
    id: 'friends',
    icon: 'mdi-account-multiple',
    labelKey: 'profile.tabs.friends',
    description: t('profile.tabDescriptions.friends'),
    component: markRaw(FriendsTab),
  },
  {
    id: 'media',
    icon: 'mdi-folder-multiple-image',
    labelKey: 'profile.tabs.media',
    description: t('profile.tabDescriptions.media'),
    component: markRaw(MediaTab),
  },
  {
    id: 'delete-account',
    icon: 'mdi-delete',
    labelKey: 'profile.tabs.deleteAccount',
    description: t('profile.tabDescriptions.deleteAccount'),
    component: markRaw(DeleteAccountTab),
  },
]

const tabs = computed(() =>
  tabDefinitions.map((tab) => ({
    ...tab,
    label: t(tab.labelKey),
  })),
)

const componentTabs = computed(() =>
  tabs.value.filter(
    (tab): tab is (typeof tabs.value)[number] & { component: Component } =>
      tab.id !== 'overview' && Boolean(tab.component),
  ),
)

const profileMenuTabIds = new Set(['overview', 'resumes', 'friends', 'media'])

const menuItems = computed<MenuItem[]>(() =>
  tabs.value
    .filter((tab) => profileMenuTabIds.has(tab.id))
    .map((tab) => ({
    id: `tab-${tab.id}`,
    icon: tab.icon,
    label: tab.label,
    tabId: tab.id,
    })),
)

function isMenuItemActive(item: MenuItem) {
  return activeTab.value === item.tabId
}

function handleMenuItemClick(item: MenuItem) {
  activeTab.value = item.tabId
}

function setActiveTab(tabId: string) {
  activeTab.value = tabId
}

const hasData = computed(() => {
  return (
    Boolean(profile.value) ||
    roles.value.length > 0 ||
    groups.value.length > 0 ||
    socialAccounts.value.length > 0 ||
    companies.value.length > 0
  )
})

const displayName = computed(() => {
  const firstName = profile.value?.firstName?.trim()
  const lastName = profile.value?.lastName?.trim()

  if (firstName || lastName) {
    return `${firstName ?? ''} ${lastName ?? ''}`.trim()
  }

  return profile.value?.username || 'Utilisateur'
})

const avatarInitials = computed(() => {
  const firstName = profile.value?.firstName?.trim()?.charAt(0) ?? ''
  const lastName = profile.value?.lastName?.trim()?.charAt(0) ?? ''

  const initials = `${firstName}${lastName}`.toUpperCase()

  if (initials) {
    return initials
  }

  return profile.value?.username?.charAt(0)?.toUpperCase() || 'U'
})

const subtitle = computed(() => {
  const role = roles.value[0]?.replace('ROLE_', '').replaceAll('_', ' ')
  return role
    ? `${role} · ${profile.value?.timezone ?? 'UTC'}`
    : t('profile.member')
})

const profileSummary = computed(() => {
  return t('profile.summary', { name: displayName.value })
})

const profileRows = computed(() => [
  { label: t('profile.fields.fullName'), value: displayName.value },
  {
    label: t('profile.fields.username'),
    value: profile.value?.username || '-',
  },
  { label: t('profile.fields.email'), value: profile.value?.email || '-' },
  {
    label: t('profile.fields.language'),
    value: profile.value?.language || '-',
  },
  { label: t('profile.fields.locale'), value: profile.value?.locale || '-' },
  {
    label: t('profile.fields.location'),
    value: profile.value?.timezone || '-',
  },
])

const conversations = computed(() => {
  if (socialAccounts.value.length === 0) {
    return conversationFallback
  }

  return socialAccounts.value.map((account, index) => ({
    avatar: conversationFallback[index % conversationFallback.length]?.avatar,
    user: account.username || account.provider || `Provider #${index + 1}`,
    message:
      account.email ||
      t('profile.connectedWith', {
        provider: account.provider ?? t('profile.providerFallback'),
      }),
  }))
})

const socialProviders = computed(() => {
  return socialAccounts.value
    .map((account) => account.provider)
    .filter((provider): provider is string => Boolean(provider))
})

function formatGroupRole(group: (typeof groups.value)[number]) {
  if (typeof group.role === 'string') {
    return group.role
  }

  if (group.role && typeof group.role === 'object' && 'id' in group.role) {
    const roleId = group.role.id
    return roleId ? String(roleId) : '-'
  }

  return '-'
}

async function loadProfileDataIfNeeded() {
  if (!isAuthenticated.value) {
    return
  }

  isLoading.value = true
  errorMessage.value = null

  try {
    if (
      !profile.value &&
      roles.value.length === 0 &&
      groups.value.length === 0
    ) {
      await auth.fetchProfileData()
    }

    const socialResponse = await $fetch<{ items?: SocialAccount[] }>(
      apiEndpoints.frontend.socialAccounts.base,
      {
        headers: auth.token
          ? { Authorization: `Bearer ${auth.token}` }
          : undefined,
      },
    )
    socialAccounts.value = socialResponse?.items ?? []
  } catch {
    errorMessage.value = t('profile.loadError')
  } finally {
    isLoading.value = false
  }
}

async function loadCompanies() {
  if (!isAuthenticated.value) {
    return
  }

  await profileCompaniesStore.fetchList()
}

async function loadCompanySchema() {
  if (!isAuthenticated.value) {
    return
  }

  await profileCompaniesStore.fetchSchema('post')
}

async function createCompany() {
  const normalizedName = createCompanyForm.value.name.trim()

  if (!normalizedName) {
    return
  }

  creatingCompany.value = true

  try {
    await profileCompaniesStore.create({
      name: normalizedName,
      legalName: normalizedName,
      ...(createCompanyForm.value.role.trim()
        ? { role: createCompanyForm.value.role.trim() }
        : {}),
      ...(createCompanyForm.value.description.trim()
        ? { description: createCompanyForm.value.description.trim() }
        : {}),
    })

    createCompanyForm.value = {
      name: '',
      role: '',
      description: '',
    }
    showCreateCompanyModal.value = false
  } finally {
    creatingCompany.value = false
  }
}

function resolveTabFromRoute() {
  const queryTab = typeof route.query.tab === 'string' ? route.query.tab : null
  const hashTab = route.hash.startsWith('#tab-')
    ? route.hash.replace('#tab-', '')
    : null
  const requestedTab = queryTab ?? hashTab

  if (requestedTab && tabs.value.some((tab) => tab.id === requestedTab)) {
    isSyncingTabWithRoute.value = true
    setActiveTab(requestedTab)
    isSyncingTabWithRoute.value = false
    return
  }

  isSyncingTabWithRoute.value = true
  setActiveTab('overview')
  isSyncingTabWithRoute.value = false
}

watch(
  () => [route.query.tab, route.hash],
  () => {
    resolveTabFromRoute()
  },
  { immediate: true },
)


onMounted(async () => {
  await Promise.all([
    loadProfileDataIfNeeded(),
    loadCompanySchema(),
    loadCompanies(),
  ])
})
</script>

<template>
  <v-container fluid>
    <v-row class="px-4">
      <v-col lg="3">
        <v-card class="profile-block" rounded="xl" elevation="0" style="height: 530px; min-width: 280px; overflow-y: auto; position: fixed">
          <div class="px-4 pt-3 pb-0">
            <v-list class="border-radius-sm" nav density="compact">
              <v-list-item
                v-for="item in menuItems"
                :key="item.id"
                class="px-3 py-1 border-radius-lg mb-2"
                :active="isMenuItemActive(item)"
                :to="item.type === 'route' ? item.to : undefined"
                @click="handleMenuItemClick(item)"
              >
                <template #prepend>
                  <v-icon
                    size="18"
                    class="material-icons-round me-2 text-dark"
                    >{{ item.icon }}</v-icon
                  >
                </template>
                <v-list-item-title class="text-dark text-sm">{{
                  item.label
                }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </div>
        </v-card>
      </v-col>
      <v-col lg="9">
        <v-window v-model="activeTab" class="mt-2">
          <v-window-item value="overview">
            <v-sheet rounded="xl">
              <div
                class="d-flex flex-column flex-md-row align-md-center justify-space-between ga-4"
                style="padding: 15px;"
              >
                <div class="d-flex align-center ga-4">
                  <UiAvatar
                    size="xl"
                    class="hero-avatar text-h4 font-weight-bold"
                  >{{ avatarInitials }}</UiAvatar
                  >
                  <div>
                    <h1 class="text-h4 font-weight-bold text-typo mb-1">
                      {{ displayName }}
                    </h1>
                    <p class="text-h6 text-medium-emphasis mb-0">{{ subtitle }}</p>
                  </div>
                </div>

                <div class="d-flex ga-2 flex-wrap">
                  <v-chip
                    color="primary"
                    variant="tonal"
                    prepend-icon="mdi-shield-account"
                  >{{ t('profile.countRoles', { count: roles.length }) }}</v-chip
                  >
                  <v-chip
                    color="secondary"
                    variant="tonal"
                    prepend-icon="mdi-account-group"
                  >{{
                      t('profile.countGroups', { count: groups.length })
                    }}</v-chip
                  >
                  <v-chip
                    color="info"
                    variant="tonal"
                    prepend-icon="mdi-connection"
                  >{{
                      t('profile.countAccounts', { count: socialAccounts.length })
                    }}</v-chip
                  >
                </div>
              </div>
            </v-sheet>

            <div v-if="isLoading" class="state-card d-flex align-center ga-3 mb-4">
              <v-progress-circular indeterminate color="primary" />
              <span>Chargement du profil...</span>
            </div>

            <v-alert
              v-else-if="errorMessage"
              type="error"
              variant="tonal"
              density="comfortable"
              class="mb-4"
              rounded="lg"
            >
              {{ errorMessage }}
            </v-alert>
            <v-alert
              v-if="!hasData"
              type="info"
              variant="tonal"
              density="comfortable"
              class="mb-4"
              rounded="lg"
            >
              Aucune donnée de profil disponible.
            </v-alert>

            <v-row v-if="hasData" class="mt-6">
              <v-col cols="12" lg="6" class="position-relative">
                <v-card
                  class="profile-block h-100 pa-4"
                  rounded="xl"
                  elevation="0"
                >
                  <h3 class="text-h5 text-typo mb-4">
                    {{ t('profile.platformSettings') }}
                  </h3>

                  <p
                    class="text-uppercase text-caption font-weight-bold text-medium-emphasis mb-3"
                  >
                    {{ t('profile.account') }}
                  </p>
                  <div class="d-flex flex-column ga-4 mb-6">
                    <div
                      v-for="setting in accountSettings"
                      :key="setting.text"
                      class="d-flex align-center justify-space-between ga-3"
                    >
                      <v-switch
                        v-model="setting.enabled"
                        color="primary"
                        hide-details
                        inset
                        density="comfortable"
                      />
                      <span class="text-body-1 text-medium-emphasis">{{
                        setting.text
                      }}</span>
                    </div>
                  </div>

                  <p
                    class="text-uppercase text-caption font-weight-bold text-medium-emphasis mb-3"
                  >
                    {{ t('profile.application') }}
                  </p>
                  <div class="d-flex flex-column ga-4">
                    <div
                      v-for="setting in applicationSettings"
                      :key="setting.text"
                      class="d-flex align-center justify-space-between ga-3"
                    >
                      <v-switch
                        v-model="setting.enabled"
                        color="primary"
                        hide-details
                        inset
                        density="comfortable"
                      />
                      <span class="text-body-1 text-medium-emphasis">{{
                        setting.text
                      }}</span>
                    </div>
                  </div>
                </v-card>
                <div class="vertical-divider d-none d-lg-block" />
              </v-col>

              <v-col cols="12" lg="6" class="position-relative">
                <v-card
                  class="profile-block h-100 pa-4"
                  rounded="xl"
                  elevation="0"
                >
                  <h3 class="text-h5 text-typo mb-4">
                    {{ t('profile.profileInformation') }}
                  </h3>
                  <p class="text-body-1 text-medium-emphasis mb-6">
                    {{ profileSummary }}
                  </p>
                  <v-divider class="mb-5" />

                  <div class="d-flex flex-column ga-3">
                    <div
                      v-for="row in profileRows"
                      :key="row.label"
                      class="text-body-1"
                    >
                      <strong class="text-typo">{{ row.label }}:</strong>
                      <span class="text-medium-emphasis ms-2">{{
                        row.value
                      }}</span>
                    </div>

                    <div class="text-body-1">
                      <strong class="text-typo"
                        >{{ t('profile.social') }}:</strong
                      >
                      <span
                        v-if="socialProviders.length"
                        class="ms-2 text-medium-emphasis"
                        >{{ socialProviders.join(', ') }}</span
                      >
                      <span v-else class="ms-2 text-medium-emphasis">{{
                        t('profile.noLinkedAccount')
                      }}</span>
                    </div>

                    <div class="text-body-1">
                      <strong class="text-typo"
                        >{{ t('profile.groups') }}:</strong
                      >
                      <span class="ms-2 text-medium-emphasis">{{
                        groups
                          .map(
                            (group) =>
                              `${group.name} (${formatGroupRole(group)})`,
                          )
                          .join(' · ') || 'Aucun groupe'
                      }}</span>
                    </div>
                  </div>
                </v-card>
                <div class="vertical-divider d-none d-lg-block" />
              </v-col>

              <v-col cols="12" lg="6" class="position-relative">
                <v-card
                  class="profile-block h-100 pa-4"
                  rounded="xl"
                  elevation="0"
                >
                  <h3 class="text-h5 text-typo mb-4">Conversations</h3>

                  <div class="d-flex flex-column ga-4">
                    <div
                      v-for="conversation in conversations"
                      :key="`${conversation.user}-${conversation.message}`"
                      class="conversation-row d-flex align-center justify-space-between ga-3"
                    >
                      <div class="d-flex align-center ga-3 flex-grow-1 min-w-0">
                        <v-avatar size="58" rounded="lg"
                          ><v-img
                            :src="conversation.avatar"
                            :alt="conversation.user"
                        /></v-avatar>
                        <div class="min-w-0">
                          <p
                            class="text-h6 font-weight-bold text-typo mb-1 text-truncate"
                          >
                            {{ conversation.user }}
                          </p>
                          <p
                            class="text-body-2 text-medium-emphasis mb-0 text-truncate"
                          >
                            {{ conversation.message }}
                          </p>
                        </div>
                      </div>
                      <button class="reply-btn">Reply</button>
                    </div>
                  </div>
                </v-card>
              </v-col>

              <v-col cols="12" lg="6" class="position-relative">
                <v-card
                  v-if="hasData"
                  class="profile-block h-100 pa-4"
                  rounded="xl"
                  elevation="0"
                >
                  <div class="d-flex align-start justify-space-between mb-4">
                    <h3 class="text-h4 text-typo mb-0">Mes Comapanies</h3>
                    <v-btn
                      color="primary"
                      icon="mdi-plus"
                      @click="showCreateCompanyModal = true"
                    />
                  </div>

                  <v-alert
                    v-if="companySchemaError"
                    type="warning"
                    variant="tonal"
                    density="comfortable"
                    rounded="lg"
                    class="mb-4"
                  >
                    {{ companySchemaError }}
                  </v-alert>

                  <div class="d-flex justify-space-between align-center mb-6">
                    <v-chip
                      v-if="usesSchemaFallback"
                      size="small"
                      color="warning"
                      variant="tonal"
                    >Fallback</v-chip>
                  </div>

                  <v-dialog
                    v-model="showCreateCompanyModal"
                    max-width="720"
                  >
                    <v-card rounded="lg">
                      <v-card-title class="d-flex align-center justify-space-between">
                        <span>Créer une company</span>
                        <v-btn icon="mdi-close" variant="text" @click="showCreateCompanyModal = false" />
                      </v-card-title>

                      <v-card-text>
                        <v-row>
                          <v-col cols="12" md="6">
                            <v-text-field
                              v-model="createCompanyForm.name"
                              :label="
                            getCompanyFieldMeta('name')?.label ||
                            'Nom de la société'
                          "
                              :required="getCompanyFieldMeta('name')?.required"
                              :disabled="creatingCompany || companySchemaLoading"
                              density="comfortable"
                              variant="outlined"
                            />
                          </v-col>
                          <v-col cols="12" md="6">
                            <v-text-field
                              v-model="createCompanyForm.role"
                              :label="getCompanyFieldMeta('role')?.label || 'Rôle'"
                              :required="getCompanyFieldMeta('role')?.required"
                              :disabled="creatingCompany || companySchemaLoading"
                              density="comfortable"
                              variant="outlined"
                            />
                          </v-col>
                          <v-col cols="12">
                            <v-textarea
                              v-model="createCompanyForm.description"
                              :label="
                            getCompanyFieldMeta('description')?.label ||
                            'Description'
                          "
                              :required="getCompanyFieldMeta('description')?.required"
                              :disabled="creatingCompany || companySchemaLoading"
                              density="comfortable"
                              variant="outlined"
                              rows="3"
                            />
                          </v-col>
                        </v-row>
                      </v-card-text>

                      <v-card-actions class="px-6 pb-6">
                        <v-spacer />
                        <v-btn variant="text" @click="showCreateCompanyModal = false">Annuler</v-btn>
                        <v-btn
                          color="primary"
                          :loading="creatingCompany"
                          :disabled="!createCompanyForm.name.trim()"
                          @click="createCompany"
                        >
                          Créer la société
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-dialog>

                  <div v-if="companiesLoading" class="d-flex align-center ga-3">
                    <v-progress-circular indeterminate color="primary" />
                    <span>Chargement des companies...</span>
                  </div>

                  <v-alert
                    v-else-if="companiesError"
                    type="error"
                    variant="tonal"
                    density="comfortable"
                    rounded="lg"
                    class="mb-4"
                  >
                    {{ companiesError }}
                  </v-alert>

                  <v-alert
                    v-else-if="companies.length === 0"
                    type="info"
                    variant="tonal"
                    density="comfortable"
                    rounded="lg"
                    class="mb-4"
                  >
                    Aucune company associée à ce profil.
                  </v-alert>

                  <v-row v-else class="mb-2">
                    <v-col
                      v-for="company in companies"
                      :key="company.id"
                      cols="12"
                      md="6"
                      xl="4"
                    >
                      <v-card
                        variant="tonal"
                        rounded="lg"
                        class="company-card h-100 pa-4"
                        :to="`/company/${company.id}/dashboard`"
                        link
                      >
                        <p class="text-h6 text-typo mb-1">{{ company.name || company.legalName || 'Company sans nom' }}</p>
                        <p class="text-body-2 text-medium-emphasis mb-3">
                          {{ company.role || company.status || 'Rôle non défini' }}
                        </p>
                        <p class="text-body-2 text-medium-emphasis mb-0">
                          {{
                            company.description || 'Aucune description disponible.'
                          }}
                        </p>
                      </v-card>
                    </v-col>
                  </v-row>

                </v-card>
              </v-col>
            </v-row>
          </v-window-item>

          <v-window-item
            v-for="tab in componentTabs"
            :key="tab.id"
            :value="tab.id"
          >
            <component :is="tab.component" />
          </v-window-item>
        </v-window>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.company-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.company-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgb(15 23 42 / 12%);
}

.company-card:active {
  transform: translateY(0);
}

.company-card:focus-visible {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
}
</style>
