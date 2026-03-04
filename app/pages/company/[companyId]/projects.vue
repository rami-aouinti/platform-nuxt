<script setup lang="ts">
import { useCompanyWorkspaceApi, type CompanyProjectSummary } from '~/composables/useCompanyWorkspaceApi'
import { apiRequest } from '~/composables/api/httpUiErrors'
import { apiEndpoints } from '~/services/api/endpoints'

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
const deletingProjectId = ref<string | number | null>(null)
const showEditDialog = ref(false)
const editingProject = ref(false)
const editProjectError = ref<string | null>(null)
const editProjectId = ref<string | number | null>(null)
const editProject = reactive({
  name: '',
  description: '',
  status: 'active',
  photoUrl: '',
})
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

function getProjectImage(project: CompanyProjectSummary) {
  return project.photoUrl || project.photo || project.image || ''
}

function getProjectDescription(project: CompanyProjectSummary) {
  return project.description || 'Aucune description fournie pour ce projet.'
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

function openEditProjectDialog(project: CompanyProjectSummary) {
  editProjectId.value = project.id
  editProject.name = String(project.name || project.title || '')
  editProject.description = String(project.description || '')
  editProject.status = String(project.status || 'active')
  editProject.photoUrl = String(project.photoUrl || project.photo || project.image || '')
  editProjectError.value = null
  showEditDialog.value = true
}

async function submitEditProject() {
  if (!editProjectId.value) {
    editProjectError.value = 'Projet invalide.'
    return
  }

  if (!editProject.name.trim()) {
    editProjectError.value = 'Le nom du projet est requis.'
    return
  }

  editingProject.value = true
  editProjectError.value = null

  try {
    await apiRequest('PATCH', apiEndpoints.frontend.projects.projectById(editProjectId.value), {
      body: {
        name: editProject.name.trim(),
        description: editProject.description.trim() || undefined,
        status: editProject.status.trim() || 'active',
        photoUrl: editProject.photoUrl.trim() || undefined,
      },
    })

    showEditDialog.value = false
    await loadProjects()
  } catch (errorValue) {
    editProjectError.value = errorValue instanceof Error ? errorValue.message : 'Impossible de modifier le projet.'
  } finally {
    editingProject.value = false
  }
}

async function deleteProject(project: CompanyProjectSummary) {
  const projectLabel = getProjectLabel(project)
  const confirmed = window.confirm(`Supprimer le projet "${projectLabel}" ?`)
  if (!confirmed) return

  deletingProjectId.value = project.id

  try {
    await apiRequest('DELETE', apiEndpoints.frontend.projects.projectById(project.id))
    await loadProjects()
  } catch (errorValue) {
    error.value = errorValue instanceof Error ? errorValue.message : 'Impossible de supprimer le projet.'
  } finally {
    deletingProjectId.value = null
  }
}
</script>

<template>
  <CompanyWorkspaceLayout active-page="projects">
    <div class="relative mb-4 min-h-[56px]">
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-white mb-0">
        Company projects
      </h1>

      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        class="absolute right-0 top-0"
        @click="openCreateProjectDialog"
      >
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

    <v-row v-else dense>
      <v-col v-for="project in projects" :key="project.id" cols="12" md="4">
        <v-card
          rounded="lg"
          class="relative h-100 border border-gray-200 transition-all hover:-translate-y-1 hover:border-primary dark:border-gray-700"
        >
          <div class="absolute right-0 top-0 z-10 pa-1">
            <v-menu>
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-dots-vertical"
                  size="small"
                  variant="text"
                  @click.stop
                />
              </template>

              <v-list density="compact">
                <v-list-item prepend-icon="mdi-pencil" title="Edit" @click="openEditProjectDialog(project)" />
                <v-list-item
                  prepend-icon="mdi-delete"
                  title="Delete"
                  :disabled="deletingProjectId === project.id"
                  @click="deleteProject(project)"
                />
              </v-list>
            </v-menu>
          </div>

          <NuxtLink :to="getProjectPath(project)" class="block text-decoration-none">
            <div class="d-flex align-center ga-3 px-4 pt-4 pr-10">
              <v-avatar size="44" rounded="lg" color="surface-variant">
                <v-img
                  v-if="getProjectImage(project)"
                  :src="getProjectImage(project)"
                  :alt="getProjectLabel(project)"
                  cover
                />
                <span v-else class="text-caption font-weight-bold">{{ getProjectLabel(project).charAt(0) }}</span>
              </v-avatar>

              <div class="min-w-0 flex-1">
                <p class="text-subtitle-1 font-weight-bold text-high-emphasis mb-1 truncate">
                  {{ getProjectLabel(project) }}
                </p>
                <v-chip size="small" color="primary" variant="tonal">{{ project.status || '-' }}</v-chip>
              </div>
            </div>

            <v-card-text class="pt-3">
              <p class="text-body-2 text-medium-emphasis mb-3 min-h-[44px] line-clamp-2">
                {{ getProjectDescription(project) }}
              </p>

            <div class="d-flex flex-column ga-1 text-caption text-medium-emphasis">
              <span><strong>ID:</strong> {{ project.id || '-' }}</span>
              <span><strong>Owner(s):</strong> {{ Array.isArray(project.owner) ? project.owner.length : 0 }}</span>
            </div>
            </v-card-text>
          </NuxtLink>
        </v-card>
      </v-col>
    </v-row>

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

    <v-dialog v-model="showEditDialog" max-width="640">
      <v-card rounded="lg">
        <v-card-title class="text-h6">Edit project</v-card-title>

        <v-card-text>
          <v-alert
            v-if="editProjectError"
            type="error"
            variant="tonal"
            density="comfortable"
            rounded="lg"
            class="mb-4"
          >
            {{ editProjectError }}
          </v-alert>

          <v-text-field v-model="editProject.name" label="Name" variant="outlined" density="comfortable" class="mb-3" />

          <v-textarea
            v-model="editProject.description"
            label="Description"
            variant="outlined"
            density="comfortable"
            auto-grow
            rows="3"
            class="mb-3"
          />

          <v-text-field v-model="editProject.status" label="Status" variant="outlined" density="comfortable" class="mb-3" />

          <v-text-field v-model="editProject.photoUrl" label="Photo URL" variant="outlined" density="comfortable" />
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn variant="text" :disabled="editingProject" @click="showEditDialog = false">Cancel</v-btn>
          <v-btn color="primary" :loading="editingProject" @click="submitEditProject">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </CompanyWorkspaceLayout>
</template>
