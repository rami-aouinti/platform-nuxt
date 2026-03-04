<script setup lang="ts">
import { useCompanyWorkspaceApi, type CompanyMembership } from '~/composables/useCompanyWorkspaceApi'

definePageMeta({ middleware: ['auth'], requiresAuth: true })

const route = useRoute()
const workspaceApi = useCompanyWorkspaceApi()

const membership = ref<CompanyMembership | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const companyId = computed(() => {
  const param = route.params.companyId
  return Array.isArray(param) ? (param[0] ?? '') : (param ?? '')
})

const userDisplayName = computed(() => {
  const user = membership.value?.user
  if (!user) return '-'
  return [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.username || user.email || '-'
})

async function loadMembership() {
  if (!companyId.value) {
    error.value = 'Identifiant de company invalide.'
    membership.value = null
    return
  }

  loading.value = true
  error.value = null

  try {
    membership.value = await workspaceApi.getMembership(companyId.value)
  } catch (errorValue) {
    membership.value = null
    error.value = errorValue instanceof Error ? errorValue.message : 'Impossible de charger les membres.'
  } finally {
    loading.value = false
  }
}

watch(companyId, loadMembership, { immediate: true })
</script>

<template>
  <CompanyWorkspaceLayout active-page="teams">
    <h1 class="text-h4 mb-4">Company teams</h1>

    <div v-if="loading" class="d-flex align-center ga-3">
      <v-progress-circular indeterminate color="primary" />
      <span>Chargement des membres...</span>
    </div>

    <v-alert
      v-else-if="error"
      type="error"
      variant="tonal"
      density="comfortable"
      rounded="lg"
      class="mb-4"
    >
      {{ error }}
    </v-alert>

    <v-alert
      v-else-if="!membership"
      type="info"
      variant="tonal"
      density="comfortable"
      rounded="lg"
      class="mb-4"
    >
      Aucun membre trouvé.
    </v-alert>

    <v-card v-else variant="tonal" rounded="lg">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <p class="text-caption text-medium-emphasis mb-1">Utilisateur</p>
            <p class="text-body-1 mb-0">{{ userDisplayName }}</p>
          </v-col>
          <v-col cols="12" md="6">
            <p class="text-caption text-medium-emphasis mb-1">Email</p>
            <p class="text-body-1 mb-0">{{ membership.user?.email || '-' }}</p>
          </v-col>
          <v-col cols="12" md="6">
            <p class="text-caption text-medium-emphasis mb-1">Rôle</p>
            <p class="text-body-1 mb-0">{{ membership.role || '-' }}</p>
          </v-col>
          <v-col cols="12" md="6">
            <p class="text-caption text-medium-emphasis mb-1">Statut</p>
            <p class="text-body-1 mb-0">{{ membership.status || '-' }}</p>
          </v-col>
          <v-col cols="12" md="6">
            <p class="text-caption text-medium-emphasis mb-1">Joined at</p>
            <p class="text-body-1 mb-0">{{ membership.joinedAt || '-' }}</p>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </CompanyWorkspaceLayout>
</template>
