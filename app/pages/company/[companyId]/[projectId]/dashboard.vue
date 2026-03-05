<script setup lang="ts">
import { apiRequest, type Id } from '~/composables/api/httpUiErrors'
import { apiEndpoints } from '~/services/api/endpoints'

definePageMeta({ middleware: ['auth'], requiresAuth: true })

type ProjectDetail = {
  id: Id
  name?: string | null
  title?: string | null
  status?: string | null
  description?: string | null
  style?: string | null
  createdAt?: string | null
  updatedAt?: string | null
  [key: string]: unknown
}

const route = useRoute()
const rawParams = route.params as Record<string, string | string[] | undefined>
const project = ref<ProjectDetail | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const companyId = computed(() => {
  const param = rawParams.companyId
  return Array.isArray(param) ? (param[0] ?? '') : (param ?? '')
})

const projectId = computed(() => {
  const param = rawParams.projectId
  return Array.isArray(param) ? (param[0] ?? '') : (param ?? '')
})

const projectRows = computed(() => {
  if (!project.value) return []

  return [
    { label: 'ID', value: String(project.value.id) },
    { label: 'Nom', value: project.value.name || project.value.title || '-' },
    { label: 'Statut', value: project.value.status || '-' },
    { label: 'Style', value: project.value.style || '-' },
    { label: 'Créé le', value: project.value.createdAt || '-' },
    { label: 'Mis à jour le', value: project.value.updatedAt || '-' },
  ]
})

async function loadProject() {
  if (!projectId.value) {
    error.value = 'Identifiant de projet invalide.'
    project.value = null
    return
  }

  loading.value = true
  error.value = null

  try {
    project.value = await apiRequest<ProjectDetail>('GET', apiEndpoints.frontend.projects.projectById(projectId.value))
  } catch (errorValue) {
    error.value = errorValue instanceof Error ? errorValue.message : 'Impossible de charger le projet.'
    project.value = null
  } finally {
    loading.value = false
  }
}

watch(projectId, loadProject, { immediate: true })
</script>

<template>
  <CompanyProjectWorkspaceLayout active-page="dashboard">
    <div class="mb-6">
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">Project dashboard</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400">Company #{{ companyId }} · Project #{{ projectId }}</p>
    </div>

    <div v-if="loading" class="d-flex align-center ga-3">
      <v-progress-circular indeterminate color="primary" />
      <span>Chargement du projet...</span>
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
      v-else-if="!project"
      type="info"
      variant="tonal"
      density="comfortable"
      rounded="lg"
      class="mb-4"
    >
      Aucun projet trouvé.
    </v-alert>

    <div v-else class="space-y-4">
      <p class="text-base text-gray-700 dark:text-gray-300">
        {{ project.description || 'Aucune description disponible.' }}
      </p>

      <v-card variant="tonal" rounded="lg" class="workspace-sidebar-card">
        <v-card-text>
          <div class="grid gap-3 sm:grid-cols-2">
            <div v-for="row in projectRows" :key="row.label">
              <p class="text-caption text-medium-emphasis mb-1">{{ row.label }}</p>
              <p class="text-body-1">{{ row.value }}</p>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </CompanyProjectWorkspaceLayout>
</template>
