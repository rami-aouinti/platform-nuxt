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
  title: 'Profil',
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
const { isAuthenticated, profile, roles, groups } = storeToRefs(auth)

const isLoading = ref(false)
const errorMessage = ref<string | null>(null)
const socialAccounts = ref<SocialAccount[]>([])

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

const projects = [
  {
    image: imageHomeDecor1,
    title: 'Project #2',
    style: 'Modern',
    description: 'As Uber works through a huge amount of internal management turmoil.',
    avatars: [imageTeam1, imageTeam2, imageTeam3, imageTeam4],
  },
  {
    image: imageHomeDecor2,
    title: 'Project #1',
    style: 'Scandinavian',
    description: 'Music is something that every person has his or her own specific opinion about.',
    avatars: [imageTeam3, imageTeam4, imageTeam1, imageTeam2],
  },
  {
    image: imageHomeDecor3,
    title: 'Project #3',
    style: 'Minimalist',
    description: 'Different people have different taste, and various types of music.',
    avatars: [imageTeam4, imageTeam3, imageTeam2, imageTeam1],
  },
  {
    image: imageHomeDecor4,
    title: 'Project #4',
    style: 'Gothic',
    description: 'Why would anyone pick blue over pink? Pink is obviously a better color.',
    avatars: [imageTeam4, imageTeam3, imageTeam2, imageTeam1],
  },
]

const hasData = computed(() => {
  return (
    Boolean(profile.value) ||
    roles.value.length > 0 ||
    groups.value.length > 0 ||
    socialAccounts.value.length > 0
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

onMounted(loadProfileDataIfNeeded)
</script>

<template>
  <v-container fluid>
    <v-sheet rounded="xl">
      <div class="d-flex flex-column flex-md-row align-md-center justify-space-between ga-4">
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
      <v-col cols="12" lg="4" class="position-relative">
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

      <v-col cols="12" lg="4" class="position-relative">
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

      <v-col cols="12" lg="4">
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
      <h3 class="text-h4 text-typo mb-1">{{ t('profile.projects') }}</h3>
      <p class="text-h6 text-medium-emphasis mb-6">Architects design houses</p>

      <v-row>
        <v-col v-for="project in projects" :key="project.title" cols="12" md="6" xl="3">
          <div class="project-card h-100">
            <v-img :src="project.image" height="190" cover class="rounded-xl mb-4" />
            <p class="text-body-1 text-medium-emphasis mb-1">{{ project.title }}</p>
            <p class="text-h4 text-typo font-weight-bold mb-3">{{ project.style }}</p>
            <p class="text-body-1 text-medium-emphasis mb-5">{{ project.description }}</p>

            <div class="d-flex align-center justify-space-between">
              <v-btn color="pink" variant="outlined" rounded="pill" class="project-btn">{{ t('profile.viewProject') }}</v-btn>
              <div class="avatar-group d-flex">
                <v-avatar v-for="avatar in project.avatars" :key="avatar" size="32" class="ms-n2 border border-white">
                  <img :src="avatar" alt="Project member" />
                </v-avatar>
              </div>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>

<style scoped>
.profile-page {
  min-height: calc(100dvh - 120px);
}

.hero-card {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(124, 90, 233, 0.2);
}

.hero-top-stripe {
  height: 84px;
  background: linear-gradient(90deg, #b22771 0%, #8a2be2 100%);
}

.hero-avatar {
  margin-top: -44px;
  border: 4px solid #fff;
  box-shadow: 0 10px 30px rgba(32, 33, 36, 0.14);
  background: linear-gradient(140deg, #293f72 0%, #5b6ba6 100%);
  color: #fff;
}

.profile-block {
  border: 1px solid rgba(17, 24, 39, 0.06);
}

.vertical-divider {
  position: absolute;
  right: -10px;
  top: 2%;
  height: 96%;
  width: 1px;
  background: rgba(17, 24, 39, 0.07);
}

.state-card {
  padding: 1rem 1.25rem;
  border-radius: 16px;
  border: 1px solid rgba(17, 24, 39, 0.1);
}

.conversation-row {
  border-radius: 14px;
  padding: 8px;
  transition: transform 0.22s ease, background-color 0.22s ease;
}

.conversation-row:hover {
  transform: translateX(6px);
  background: rgba(178, 39, 113, 0.06);
}

.reply-btn {
  text-transform: uppercase;
  color: #e91e63;
  font-weight: 700;
  letter-spacing: 0.04em;
  background: transparent;
}

.project-card {
  border-radius: 1rem;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.project-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 18px 35px rgba(17, 24, 39, 0.12);
}

.project-btn {
  border-width: 2px;
  font-weight: 700;
  letter-spacing: 0.02em;
}
</style>
