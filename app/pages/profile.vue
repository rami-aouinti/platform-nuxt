<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  icon: 'mdi-account-circle-outline',
  title: 'Profile',
  middleware: 'auth',
  requiresAuth: true,
})

const auth = useAuthStore()
const { isAuthenticated, profile, roles, groups } = storeToRefs(auth)

const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

const identityFields = [
  { label: 'ID', key: 'id', icon: 'mdi-identifier' },
  { label: 'Username', key: 'username', icon: 'mdi-account-outline' },
  { label: 'Email', key: 'email', icon: 'mdi-email-outline' },
  {
    label: 'First name',
    key: 'firstName',
    icon: 'mdi-card-account-details-outline',
  },
  { label: 'Last name', key: 'lastName', icon: 'mdi-badge-account-outline' },
  { label: 'Language', key: 'language', icon: 'mdi-translate' },
  { label: 'Locale', key: 'locale', icon: 'mdi-map-marker-radius-outline' },
  { label: 'Timezone', key: 'timezone', icon: 'mdi-earth' },
] as const

const hasData = computed(() => {
  return (
    Boolean(profile.value) || roles.value.length > 0 || groups.value.length > 0
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

function formatProfileValue(key: string) {
  const value = profile.value?.[key]

  if (value === undefined || value === null || value === '') {
    return '-'
  }

  return String(value)
}

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

  if (hasData.value) {
    return
  }

  isLoading.value = true
  errorMessage.value = null

  try {
    await auth.fetchProfileData()
  } catch {
    errorMessage.value = 'Impossible de charger les informations du profil.'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadProfileDataIfNeeded)
</script>

<template>
  <v-container fluid class="profile-page pa-4 pa-md-6">
    <v-row class="mb-6">
      <v-col cols="12">
        <v-sheet class="hero-card pa-6 pa-md-8" rounded="xl">
          <div
            class="d-flex flex-column flex-sm-row ga-4 align-sm-center justify-space-between"
          >
            <div class="d-flex ga-4 align-center">
              <UiAvatar
                size="xl"
                color="primary"
                class="text-h5 font-weight-bold"
              >
                {{ avatarInitials }}
              </UiAvatar>

              <div>
                <p class="text-overline text-medium-emphasis mb-1">
                  Mon espace
                </p>
                <h1 class="text-h4 font-weight-bold mb-1">{{ displayName }}</h1>
                <p class="text-body-2 text-medium-emphasis mb-0">
                  Consultez vos informations, vos rôles et vos groupes en un
                  coup d'œil.
                </p>
              </div>
            </div>

            <div class="d-flex ga-3 flex-wrap">
              <v-chip
                color="primary"
                variant="elevated"
                prepend-icon="mdi-shield-account-outline"
              >
                {{ roles.length }} rôle{{ roles.length > 1 ? 's' : '' }}
              </v-chip>
              <v-chip
                color="secondary"
                variant="elevated"
                prepend-icon="mdi-account-group-outline"
              >
                {{ groups.length }} groupe{{ groups.length > 1 ? 's' : '' }}
              </v-chip>
            </div>
          </div>
        </v-sheet>
      </v-col>
    </v-row>

    <div v-if="isLoading" class="state-card d-flex align-center ga-3">
      <v-progress-circular indeterminate color="primary" />
      <span>Chargement du profil...</span>
    </div>

    <v-alert
      v-else-if="errorMessage"
      type="error"
      variant="tonal"
      density="comfortable"
      class="mb-0"
      rounded="lg"
    >
      {{ errorMessage }}
    </v-alert>

    <v-alert
      v-else-if="!hasData"
      type="info"
      variant="tonal"
      density="comfortable"
      class="mb-0"
      rounded="lg"
    >
      Aucune donnée de profil disponible.
    </v-alert>

    <v-row v-else class="ga-0">
      <v-col cols="12" md="5" class="pr-md-3 mb-4 mb-md-0">
        <UiCard rounded="xl" elevation="0" shadow="md" class="h-100">
          <v-card-item>
            <v-card-title class="d-flex align-center ga-2">
              <v-icon icon="mdi-card-account-details-outline" color="primary" />
              Identité
            </v-card-title>
            <v-card-subtitle
              >Informations personnelles de votre compte</v-card-subtitle
            >
          </v-card-item>

          <v-divider />

          <v-list class="py-0" lines="two">
            <v-list-item
              v-for="field in identityFields"
              :key="field.key"
              min-height="64"
            >
              <template #prepend>
                <UiAvatar size="sm" color="surface-variant">
                  <v-icon :icon="field.icon" size="18" />
                </UiAvatar>
              </template>

              <v-list-item-title class="font-weight-medium">{{
                field.label
              }}</v-list-item-title>
              <v-list-item-subtitle>{{
                formatProfileValue(field.key)
              }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </UiCard>
      </v-col>

      <v-col cols="12" md="7" class="pl-md-3">
        <v-row>
          <v-col cols="12" class="pb-4">
            <UiCard rounded="xl" elevation="0" shadow="md">
              <v-card-item>
                <v-card-title class="d-flex align-center ga-2">
                  <v-icon icon="mdi-shield-account-outline" color="primary" />
                  Roles
                </v-card-title>
                <v-card-subtitle
                  >Autorisations attribuées à votre profil</v-card-subtitle
                >
              </v-card-item>

              <v-divider />

              <v-card-text>
                <div v-if="roles.length > 0" class="d-flex flex-wrap ga-2">
                  <v-chip
                    v-for="role in roles"
                    :key="role"
                    color="primary"
                    variant="tonal"
                    prepend-icon="mdi-shield-check-outline"
                  >
                    {{ role }}
                  </v-chip>
                </div>
                <p v-else class="text-medium-emphasis mb-0">Aucun rôle.</p>
              </v-card-text>
            </UiCard>
          </v-col>

          <v-col cols="12">
            <UiCard rounded="xl" elevation="0" shadow="md">
              <v-card-item>
                <v-card-title class="d-flex align-center ga-2">
                  <v-icon icon="mdi-account-group-outline" color="secondary" />
                  Groups
                </v-card-title>
                <v-card-subtitle
                  >Groupes et niveau d'accès associés</v-card-subtitle
                >
              </v-card-item>

              <v-divider />

              <v-list v-if="groups.length > 0" class="py-0">
                <v-list-item
                  v-for="group in groups"
                  :key="`${group.id}-${group.name}`"
                  min-height="64"
                >
                  <template #prepend>
                    <UiAvatar size="sm" color="secondary" variant="tonal">
                      <v-icon icon="mdi-account-group" size="18" />
                    </UiAvatar>
                  </template>

                  <v-list-item-title class="font-weight-medium">{{
                    group.name
                  }}</v-list-item-title>
                  <v-list-item-subtitle class="text-medium-emphasis">
                    Rôle du groupe: {{ formatGroupRole(group) }}
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
              <v-card-text v-else>
                <p class="text-medium-emphasis mb-0">Aucun groupe.</p>
              </v-card-text>
            </UiCard>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.profile-page {
  background:
    radial-gradient(
      circle at top right,
      rgb(var(--v-theme-primary), 0.09),
      transparent 35%
    ),
    radial-gradient(
      circle at 10% 10%,
      rgb(var(--v-theme-secondary), 0.06),
      transparent 30%
    );
  min-height: calc(100dvh - 120px);
}

.hero-card {
  border: 1px solid rgb(var(--v-theme-primary), 0.15);
  background: linear-gradient(
    140deg,
    rgb(var(--v-theme-surface)) 0%,
    rgb(var(--v-theme-primary), 0.08) 140%
  );
}

.state-card {
  padding: 1rem 1.25rem;
  border-radius: 16px;
  border: 1px solid rgb(var(--v-theme-primary), 0.15);
  background: rgb(var(--v-theme-surface));
}
</style>
