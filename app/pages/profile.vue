<script setup lang="ts">
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
  { label: 'ID', key: 'id' },
  { label: 'Username', key: 'username' },
  { label: 'Email', key: 'email' },
  { label: 'First name', key: 'firstName' },
  { label: 'Last name', key: 'lastName' },
  { label: 'Language', key: 'language' },
  { label: 'Locale', key: 'locale' },
  { label: 'Timezone', key: 'timezone' },
] as const

const hasData = computed(() => {
  return (
    Boolean(profile.value) || roles.value.length > 0 || groups.value.length > 0
  )
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
  <v-container fluid class="pa-6">
    <v-card rounded="xl" elevation="6" class="pa-6">
      <h1 class="text-h4 font-weight-bold mb-4">Profile</h1>

      <div v-if="isLoading" class="d-flex align-center ga-3">
        <v-progress-circular indeterminate color="primary" />
        <span>Chargement du profil...</span>
      </div>

      <v-alert
        v-else-if="errorMessage"
        type="error"
        variant="tonal"
        density="comfortable"
        class="mb-0"
      >
        {{ errorMessage }}
      </v-alert>

      <v-alert
        v-else-if="!hasData"
        type="info"
        variant="tonal"
        density="comfortable"
        class="mb-0"
      >
        Aucune donnée de profil disponible.
      </v-alert>

      <div v-else class="d-flex flex-column ga-6">
        <section>
          <h2 class="text-h6 mb-3">Identité</h2>
          <v-list density="compact" class="py-0">
            <v-list-item
              v-for="field in identityFields"
              :key="field.key"
              class="px-0"
            >
              <v-list-item-title>
                <strong>{{ field.label }}:</strong>
                {{ formatProfileValue(field.key) }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </section>

        <section>
          <h2 class="text-h6 mb-3">Roles</h2>
          <v-list v-if="roles.length > 0" density="compact" class="py-0">
            <v-list-item v-for="role in roles" :key="role" class="px-0">
              <v-list-item-title>{{ role }}</v-list-item-title>
            </v-list-item>
          </v-list>
          <p v-else class="text-medium-emphasis mb-0">Aucun rôle.</p>
        </section>

        <section>
          <h2 class="text-h6 mb-3">Groups</h2>
          <v-list v-if="groups.length > 0" density="compact" class="py-0">
            <v-list-item
              v-for="group in groups"
              :key="`${group.id}-${group.name}`"
              class="px-0"
            >
              <v-list-item-title>
                {{ group.name }}
                <span class="text-medium-emphasis"
                  >(Role: {{ formatGroupRole(group) }})</span
                >
              </v-list-item-title>
            </v-list-item>
          </v-list>
          <p v-else class="text-medium-emphasis mb-0">Aucun groupe.</p>
        </section>
      </div>
    </v-card>
  </v-container>
</template>
