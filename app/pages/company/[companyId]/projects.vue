<script setup lang="ts">
import { useCompanyWorkspaceApi, type CompanyProjectSummary } from '~/composables/useCompanyWorkspaceApi'

definePageMeta({ middleware: ['auth'], requiresAuth: true })

const route = useRoute()
const rawParams = route.params as Record<string, string | string[] | undefined>
const workspaceApi = useCompanyWorkspaceApi()

const projects = ref<CompanyProjectSummary[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const showCreateDialog = ref(false)
const creatingProject = ref(false)
const createProjectError = ref<string | null>(null)
const newProject = reactive({
  name: '',
  description: '',
  status: 'active',
  photoUrl: '',
})

const companyId = computed(() => {
  const param = rawParams.companyId
  return Array.isArray(param) ? (param[0] ?? '') : (param ?? '')
})

async function loadProjects() {
  if (!companyId.value) {
    projects.value = []
    error.value = 'Identifiant de société invalide.'
    return
  }

  loading.value = true
  error.value = null

  try {
    projects.value = await workspaceApi.listCompanyProjects(companyId.value)
  } catch (errorValue) {
    projects.value = []
    error.value = errorValue instanceof Error ? errorValue.message : 'Impossible de charger les projets.'
  } finally {
    loading.value = false
  }
}

watch(companyId, loadProjects, { immediate: true })

function getProjectLabel(project: CompanyProjectSummary) {
  return project.name || project.title || 'Projet sans nom'
}

function getProjectPath(project: CompanyProjectSummary) {
  return `/company/${companyId.value}/${project.id}/dashboard`
}

function resetCreateProjectForm() {
  newProject.name = ''
  newProject.description = ''
  newProject.status = 'active'
  newProject.photoUrl = ''
  createProjectError.value = null
}

function openCreateProjectDialog() {
  resetCreateProjectForm()
  showCreateDialog.value = true
}

async function submitCreateProject() {
  if (!companyId.value) {
    createProjectError.value = 'Identifiant de société invalide.'
    return
  }

  if (!newProject.name.trim()) {
    createProjectError.value = 'Le nom du projet est requis.'
    return
  }

  creatingProject.value = true
  createProjectError.value = null

  try {
    await workspaceApi.createProject({
      name: newProject.name.trim(),
      description: newProject.description.trim() || undefined,
      status: newProject.status.trim() || 'active',
      companyId: companyId.value,
      photoUrl: newProject.photoUrl.trim() || undefined,
    })

    showCreateDialog.value = false
    await loadProjects()
  } catch (errorValue) {
    createProjectError.value = errorValue instanceof Error ? errorValue.message : 'Impossible de créer le projet.'
  } finally {
    creatingProject.value = false
  }
}
</script>

<template>
  <CompanyWorkspaceLayout active-page="projects">
    <div class="mb-4 flex items-center justify-between gap-3">
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white mb-0">
        Company projects
      </h1>

      <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateProjectDialog">
        Add project
      </v-btn>
    </div>

    <div v-if="loading" class="d-flex align-center ga-3">
      <v-progress-circular indeterminate color="primary" />
      <span>Chargement des projets...</span>
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
      v-else-if="projects.length === 0"
      type="info"
      variant="tonal"
      density="comfortable"
      rounded="lg"
      class="mb-4"
    >
      Aucun projet trouvé pour cette société.
    </v-alert>

    <div v-else class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <NuxtLink
        v-for="project in projects"
        :key="project.id"
        :to="getProjectPath(project)"
        class="block rounded-lg border border-gray-200 p-4 transition hover:border-primary-400 hover:bg-primary-50/40 dark:border-gray-700 dark:hover:border-primary-400 dark:hover:bg-slate-800"
      >
        <p class="text-base font-semibold text-gray-900 dark:text-white mb-1">
          {{ getProjectLabel(project) }}
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Statut : {{ project.status || '-' }}
        </p>
      </NuxtLink>
    </div>

    <v-dialog v-model="showCreateDialog" max-width="640">
      <v-card rounded="lg">
        <v-card-title class="text-h6">Add project</v-card-title>

        <v-card-text>
          <v-alert
            v-if="createProjectError"
            type="error"
            variant="tonal"
            density="comfortable"
            rounded="lg"
            class="mb-4"
          >
            {{ createProjectError }}
          </v-alert>

          <v-text-field v-model="newProject.name" label="Name" variant="outlined" density="comfortable" class="mb-3" />

          <v-textarea
            v-model="newProject.description"
            label="Description"
            variant="outlined"
            density="comfortable"
            auto-grow
            rows="3"
            class="mb-3"
          />

          <v-text-field v-model="newProject.status" label="Status" variant="outlined" density="comfortable" class="mb-3" />

          <v-text-field v-model="newProject.photoUrl" label="Photo URL" variant="outlined" density="comfortable" />
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn variant="text" :disabled="creatingProject" @click="showCreateDialog = false">Cancel</v-btn>
          <v-btn color="primary" :loading="creatingProject" @click="submitCreateProject">Create</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </CompanyWorkspaceLayout>
</template>
