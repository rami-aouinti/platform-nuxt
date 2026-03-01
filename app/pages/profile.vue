<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import imageKalVisualsSquare from '@/assets/img/kal-visuals-square.jpg'
import imageMarie from '@/assets/img/marie.jpg'
import imageIvanaSquare from '@/assets/img/ivana-square.jpg'
import imageTeam4 from '@/assets/img/team-4.jpg'
import imageTeam3 from '@/assets/img/team-3.jpg'
import imageHomeDecor1 from '@/assets/img/home-decor-1.jpg'
import imageHomeDecor2 from '@/assets/img/home-decor-2.jpg'
import imageHomeDecor3 from '@/assets/img/home-decor-3.jpg'
import imageHomeDecor4 from '@/assets/img/home-decor-4.jpg'
import imageTeam1 from '@/assets/img/team-1.jpg'
import imageTeam2 from '@/assets/img/team-2.jpg'

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

type Company = {
  id: string
  name: string
  role?: string | null
  description?: string | null
}

type ProfileProject = {
  id: string
  title: string
  style?: string | null
  description?: string | null
}

const { t } = useI18n()
const auth = useAuthStore()
const { isAuthenticated, profile, roles, groups } = storeToRefs(auth)
const router = useRouter()
const route = useRoute()

const isLoading = ref(false)
const errorMessage = ref<string | null>(null)
const socialAccounts = ref<SocialAccount[]>([])
const companies = ref<Company[]>([])
const companiesLoading = ref(false)
const companiesError = ref<string | null>(null)
const projects = ref<ProfileProject[]>([])
const projectsLoading = ref(false)
const projectsError = ref<string | null>(null)

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
  { avatar: imageKalVisualsSquare, user: 'Sophie B.', message: 'Hi! I need more information..' },
  { avatar: imageMarie, user: 'Anne Marie', message: 'Awesome work, can you..' },
  { avatar: imageIvanaSquare, user: 'Ivanna', message: 'About files I can..' },
  { avatar: imageTeam4, user: 'Peterson', message: 'Have a great afternoon..' },
  { avatar: imageTeam3, user: 'Nick Daniel', message: 'Hi! I need more information..' },
]

const projectImages = [imageHomeDecor1, imageHomeDecor2, imageHomeDecor3, imageHomeDecor4]
const projectAvatars = [imageTeam1, imageTeam2, imageTeam3, imageTeam4]

const menu = ref([
  { icon: 'mdi-person', text: 'Profile', to: '/profile' },
  { icon: 'mdi-receipt', text: 'Basic Info', to: '/profile/basic-info' },
  { icon: 'mdi-lock', text: 'Change Password', to: '/profile/change-password' },
  { icon: 'mdi-security', text: '2FA', to: '/profile/two-factor-auth' },
  { icon: 'mdi-clipboard-account', text: 'Accounts', to: '/profile/accounts' },
  { icon: 'mdi-file-account', text: t('profile.resumes'), to: '/resumes' },
  { icon: 'mdi-bell', text: 'Notifications', to: '/profile/notifications' },
  { icon: 'mdi-settings', text: 'Sessions', to: '/profile/sessions' },
  { icon: 'mdi-delete', text: 'Delete Account', to: '/profile/delete-account' },
])

const hasData = computed(() => {
  return (
    Boolean(profile.value) ||
    roles.value.length > 0 ||
    groups.value.length > 0 ||
    socialAccounts.value.length > 0 ||
    companies.value.length > 0 ||
    projects.value.length > 0
  )
})

const decoratedProjects = computed(() => {
  return projects.value.map((project, index) => ({
    ...project,
    image: projectImages[index % projectImages.length],
    avatars: [
      projectAvatars[index % projectAvatars.length],
      projectAvatars[(index + 1) % projectAvatars.length],
      projectAvatars[(index + 2) % projectAvatars.length],
      projectAvatars[(index + 3) % projectAvatars.length],
    ],
  }))
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
  return role ? `${role} · ${profile.value?.timezone ?? 'UTC'}` : t('profile.member')
})

const profileSummary = computed(() => {
  return t('profile.summary', { name: displayName.value })
})

const profileRows = computed(() => [
  { label: t('profile.fields.fullName'), value: displayName.value },
  { label: t('profile.fields.username'), value: profile.value?.username || '-' },
  { label: t('profile.fields.email'), value: profile.value?.email || '-' },
  { label: t('profile.fields.language'), value: profile.value?.language || '-' },
  { label: t('profile.fields.locale'), value: profile.value?.locale || '-' },
  { label: t('profile.fields.location'), value: profile.value?.timezone || '-' },
])

const conversations = computed(() => {
  if (socialAccounts.value.length === 0) {
    return conversationFallback
  }

  return socialAccounts.value.map((account, index) => ({
    avatar: conversationFallback[index % conversationFallback.length]?.avatar,
    user: account.username || account.provider || `Provider #${index + 1}`,
    message: account.email || t('profile.connectedWith', { provider: account.provider ?? t('profile.providerFallback') }),
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

function normalizeItems<T>(response: T[] | { items?: T[] } | null | undefined): T[] {
  if (Array.isArray(response)) {
    return response
  }

  return response?.items ?? []
}

function parseCompany(item: Record<string, unknown>, index: number): Company {
  return {
    id: String(item.id ?? item.companyId ?? index),
    name: String(item.name ?? item.companyName ?? `Company #${index + 1}`),
    role: typeof item.role === 'string' ? item.role : null,
    description: typeof item.description === 'string' ? item.description : null,
  }
}

function parseProject(item: Record<string, unknown>, index: number): ProfileProject {
  return {
    id: String(item.id ?? item.projectId ?? index),
    title: String(item.title ?? item.name ?? `Project #${index + 1}`),
    style: typeof item.style === 'string' ? item.style : null,
    description: typeof item.description === 'string' ? item.description : null,
  }
}

async function navigateFromProfileMenu(to: string) {
  if (route.path === to) {
    return
  }

  await router.push(to)
}

async function loadProfileDataIfNeeded() {
  if (!isAuthenticated.value) {
    return
  }

  isLoading.value = true
  errorMessage.value = null

  try {
    if (!profile.value && roles.value.length === 0 && groups.value.length === 0) {
      await auth.fetchProfileData()
    }

    const socialResponse = await $fetch<{ items?: SocialAccount[] }>('/api/v1/me/social-accounts', {
      headers: auth.token ? { Authorization: `Bearer ${auth.token}` } : undefined,
    })
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

  companiesLoading.value = true
  companiesError.value = null

  try {
    const companiesResponse = await $fetch<Record<string, unknown>[] | { items?: Record<string, unknown>[] }>(
      '/api/v1/me/profile/companies',
      {
        headers: auth.token ? { Authorization: `Bearer ${auth.token}` } : undefined,
      },
    )

    companies.value = normalizeItems(companiesResponse).map(parseCompany)
  } catch {
    companiesError.value = 'Impossible de charger vos companies.'
    companies.value = []
  } finally {
    companiesLoading.value = false
  }
}

async function loadProjects() {
  if (!isAuthenticated.value) {
    return
  }

  projectsLoading.value = true
  projectsError.value = null

  try {
    const projectsResponse = await $fetch<Record<string, unknown>[] | { items?: Record<string, unknown>[] }>(
      '/api/v1/me/profile/projects',
      {
        headers: auth.token ? { Authorization: `Bearer ${auth.token}` } : undefined,
      },
    )

    projects.value = normalizeItems(projectsResponse).map(parseProject)
  } catch {
    projectsError.value = 'Impossible de charger vos projects.'
    projects.value = []
  } finally {
    projectsLoading.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadProfileDataIfNeeded(), loadCompanies(), loadProjects()])
})
</script>

<template>
  <v-container fluid>
    <v-row class="px-4">
      <v-col lg="3">
        <v-card class="card-shadow border-radius-xl position-sticky top-1">
          <div class="px-4 pt-3 pb-0">
            <v-list class="border-radius-sm" nav>
              <v-list-item
                v-for="item in menu"
                :key="item.icon"
                class="px-3 py-1 border-radius-lg mb-2"
                :active="route.path === item.to"
                @click="navigateFromProfileMenu(item.to)"
              >
                <template #prepend>
                  <v-icon size="18" class="material-icons-round me-2 text-dark">{{ item.icon }}</v-icon>
                </template>
                <v-list-item-title class="text-dark text-sm">{{ item.text }}</v-list-item-title>
              </v-list-item>
            </v-list>

            <div class="px-3 pb-3 pt-1">
              <v-btn
                color="primary"
                variant="tonal"
                block
                rounded="lg"
                prepend-icon="mdi-plus-circle-outline"
                @click="navigateFromProfileMenu('/resumes/new')"
              >
                {{ t('profile.createResume') }}
              </v-btn>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col lg="9">
        <v-sheet rounded="xl">
          <div class="d-flex flex-column flex-md-row align-md-center justify-space-between ga-4" style="padding: 15px; margin: 15px;">
            <div class="d-flex align-center ga-4">
              <UiAvatar size="xl" class="hero-avatar text-h4 font-weight-bold">{{ avatarInitials }}</UiAvatar>
              <div>
                <h1 class="text-h4 font-weight-bold text-typo mb-1">{{ displayName }}</h1>
                <p class="text-h6 text-medium-emphasis mb-0">{{ subtitle }}</p>
              </div>
            </div>

            <div class="d-flex ga-2 flex-wrap">
              <v-chip color="primary" variant="tonal" prepend-icon="mdi-shield-account">{{ t('profile.countRoles', { count: roles.length }) }}</v-chip>
              <v-chip color="secondary" variant="tonal" prepend-icon="mdi-account-group">{{ t('profile.countGroups', { count: groups.length }) }}</v-chip>
              <v-chip color="info" variant="tonal" prepend-icon="mdi-connection">{{ t('profile.countAccounts', { count: socialAccounts.length }) }}</v-chip>
            </div>
          </div>
        </v-sheet>

        <div v-if="isLoading" class="state-card d-flex align-center ga-3 mb-4">
          <v-progress-circular indeterminate color="primary" />
          <span>Chargement du profil...</span>
        </div>

        <v-alert v-else-if="errorMessage" type="error" variant="tonal" density="comfortable" class="mb-4" rounded="lg">
          {{ errorMessage }}
        </v-alert>

        <v-alert v-else-if="!hasData" type="info" variant="tonal" density="comfortable" class="mb-4" rounded="lg">
          Aucune donnée de profil disponible.
        </v-alert>

        <v-row v-else>
          <v-col cols="12" lg="6" class="position-relative">
            <v-card class="profile-block h-100 pa-4" rounded="xl" elevation="0">
              <h3 class="text-h5 text-typo mb-4">{{ t('profile.platformSettings') }}</h3>

              <p class="text-uppercase text-caption font-weight-bold text-medium-emphasis mb-3">{{ t('profile.account') }}</p>
              <div class="d-flex flex-column ga-4 mb-6">
                <div v-for="setting in accountSettings" :key="setting.text" class="d-flex align-center justify-space-between ga-3">
                  <v-switch v-model="setting.enabled" color="primary" hide-details inset density="comfortable" />
                  <span class="text-body-1 text-medium-emphasis">{{ setting.text }}</span>
                </div>
              </div>

              <p class="text-uppercase text-caption font-weight-bold text-medium-emphasis mb-3">{{ t('profile.application') }}</p>
              <div class="d-flex flex-column ga-4">
                <div v-for="setting in applicationSettings" :key="setting.text" class="d-flex align-center justify-space-between ga-3">
                  <v-switch v-model="setting.enabled" color="primary" hide-details inset density="comfortable" />
                  <span class="text-body-1 text-medium-emphasis">{{ setting.text }}</span>
                </div>
              </div>
            </v-card>
            <div class="vertical-divider d-none d-lg-block" />
          </v-col>

          <v-col cols="12" lg="6" class="position-relative">
            <v-card class="profile-block h-100 pa-4" rounded="xl" elevation="0">
              <h3 class="text-h5 text-typo mb-4">{{ t('profile.profileInformation') }}</h3>
              <p class="text-body-1 text-medium-emphasis mb-6">{{ profileSummary }}</p>
              <v-divider class="mb-5" />

              <div class="d-flex flex-column ga-3">
                <div v-for="row in profileRows" :key="row.label" class="text-body-1">
                  <strong class="text-typo">{{ row.label }}:</strong>
                  <span class="text-medium-emphasis ms-2">{{ row.value }}</span>
                </div>

                <div class="text-body-1">
                  <strong class="text-typo">{{ t('profile.social') }}:</strong>
                  <span v-if="socialProviders.length" class="ms-2 text-medium-emphasis">{{ socialProviders.join(', ') }}</span>
                  <span v-else class="ms-2 text-medium-emphasis">{{ t('profile.noLinkedAccount') }}</span>
                </div>

                <div class="text-body-1">
                  <strong class="text-typo">{{ t('profile.groups') }}:</strong>
                  <span class="ms-2 text-medium-emphasis">{{ groups.map((group) => `${group.name} (${formatGroupRole(group)})`).join(' · ') || 'Aucun groupe' }}</span>
                </div>
              </div>
            </v-card>
            <div class="vertical-divider d-none d-lg-block" />
          </v-col>

          <v-col cols="12" lg="6">
            <v-card class="profile-block h-100 pa-4" rounded="xl" elevation="0">
              <h3 class="text-h5 text-typo mb-4">Conversations</h3>

              <div class="d-flex flex-column ga-4">
                <div v-for="conversation in conversations" :key="`${conversation.user}-${conversation.message}`" class="conversation-row d-flex align-center justify-space-between ga-3">
                  <div class="d-flex align-center ga-3 flex-grow-1 min-w-0">
                    <v-avatar size="58" rounded="lg"><img :src="conversation.avatar" :alt="conversation.user" /></v-avatar>
                    <div class="min-w-0">
                      <p class="text-h6 font-weight-bold text-typo mb-1 text-truncate">{{ conversation.user }}</p>
                      <p class="text-body-2 text-medium-emphasis mb-0 text-truncate">{{ conversation.message }}</p>
                    </div>
                  </div>
                  <button class="reply-btn">Reply</button>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <v-card v-if="hasData" class="profile-block mt-6 pa-4 pa-md-6" rounded="xl" elevation="0">
          <h3 class="text-h4 text-typo mb-1">Mes companies</h3>
          <p class="text-h6 text-medium-emphasis mb-6">Vos entreprises associées</p>

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
            <v-col v-for="company in companies" :key="company.id" cols="12" md="6" xl="4">
              <v-card variant="tonal" rounded="lg" class="h-100 pa-4">
                <p class="text-h6 text-typo mb-1">{{ company.name }}</p>
                <p class="text-body-2 text-medium-emphasis mb-3">{{ company.role || 'Rôle non défini' }}</p>
                <p class="text-body-2 text-medium-emphasis mb-0">{{ company.description || 'Aucune description disponible.' }}</p>
              </v-card>
            </v-col>
          </v-row>

          <v-divider class="my-6" />

          <h3 class="text-h4 text-typo mb-1">{{ t('profile.projects') }}</h3>
          <p class="text-h6 text-medium-emphasis mb-6">Architects design houses</p>

          <div v-if="projectsLoading" class="d-flex align-center ga-3">
            <v-progress-circular indeterminate color="primary" />
            <span>Chargement des projects...</span>
          </div>

          <v-alert
            v-else-if="projectsError"
            type="error"
            variant="tonal"
            density="comfortable"
            rounded="lg"
            class="mb-4"
          >
            {{ projectsError }}
          </v-alert>

          <v-alert
            v-else-if="decoratedProjects.length === 0"
            type="info"
            variant="tonal"
            density="comfortable"
            rounded="lg"
            class="mb-4"
          >
            Aucun project associé à ce profil.
          </v-alert>

          <v-row v-else>
            <v-col v-for="project in decoratedProjects" :key="project.id" cols="12" md="6" xl="3">
              <div class="project-card h-100">
                <v-img :src="project.image" height="190" cover class="rounded-xl mb-4" />
                <p class="text-body-1 text-medium-emphasis mb-1">{{ project.title }}</p>
                <p class="text-h4 text-typo font-weight-bold mb-3">{{ project.style || '-' }}</p>
                <p class="text-body-1 text-medium-emphasis mb-5">{{ project.description || 'Aucune description disponible.' }}</p>

                <div class="d-flex align-center justify-space-between">
                  <v-btn color="pink" variant="outlined" rounded="pill" class="project-btn">{{ t('profile.viewProject') }}</v-btn>
                  <div class="avatar-group d-flex">
                    <v-avatar v-for="avatar in project.avatars" :key="avatar" size="32" class="ms-n2 border border-white">
                      <v-img :src="avatar" alt="Project member" />
                    </v-avatar>
                  </div>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
