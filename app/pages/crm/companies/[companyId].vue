<script setup lang="ts">
import { Notify } from '~/stores/notification'
import { useCrmApi } from '~/composables/api/useCrmApi'
import { useAuthStore } from '~/stores/auth'
import type { CrmCompany, CrmProject } from '~/composables/api/useCrmApi'
import { PERMISSION_MESSAGES } from '~/utils/permissions/messages'
import {
  canCreateProject,
  type CompanyPermissionSubject,
  type TaskManagerUser,
} from '~/utils/permissions/task-manager'

type CrmProjectExtended = CrmProject & {
  company?: { id?: string; name?: string } | string | null
  companyId?: string | null
  permissions?: { canCreateTask?: boolean; canEdit?: boolean } | null
}

const route = useRoute()
const router = useRouter()
const crmApi = useCrmApi()
const authStore = useAuthStore()

definePageMeta({
  icon: 'mdi-office-building-outline',
  title: 'CRM · Company',
  requiresAuth: true,
  middleware: ['auth'],
})

const companyId = computed(() =>
  String((route.params as { companyId?: string }).companyId || ''),
)
const loading = ref(false)
const createLoading = ref(false)
const company = ref<CrmCompany | null>(null)
const companyMembershipIds = ref<string[]>([])
const projects = ref<CrmProjectExtended[]>([])
const errorMessage = ref('')
const createDialog = ref(false)

const projectForm = reactive({
  name: '',
  description: '',
})

const currentUser = computed<TaskManagerUser>(() => ({
  id: authStore.profile?.id ?? null,
  roles: authStore.roles,
  membershipCompanyIds: companyMembershipIds.value,
}))

const companyPermissionSubject = computed<CompanyPermissionSubject>(() => ({
  companyId: companyId.value || null,
}))

function normalizeItems<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[]
  if (
    value &&
    typeof value === 'object' &&
    'items' in value &&
    Array.isArray((value as { items?: unknown }).items)
  ) {
    return (value as { items: T[] }).items
  }
  if (
    value &&
    typeof value === 'object' &&
    'data' in value &&
    Array.isArray((value as { data?: unknown }).data)
  ) {
    return (value as { data: T[] }).data
  }
  return []
}

const canCreateProjectInCompany = computed(() => {
  if (!company.value) return false
  const entry = company.value as CrmCompany & {
    canCreateProject?: boolean
    permissions?: { canCreateProject?: boolean } | null
  }

  if (typeof entry.canCreateProject === 'boolean') return entry.canCreateProject
  if (
    entry.permissions &&
    typeof entry.permissions.canCreateProject === 'boolean'
  ) {
    return entry.permissions.canCreateProject
  }

  return canCreateProject(currentUser.value, companyPermissionSubject.value)
})

function getCompanyDisplayName(entry: CrmCompany | null) {
  if (!entry) return 'Company'
  return entry.legalName?.trim() || entry.name
}

function getCompanyAvatar(entry: CrmCompany | null) {
  if (!entry) return undefined
  return entry.image || entry.photo || entry.photoUrl || undefined
}

function getProjectAvatar(project: CrmProjectExtended) {
  return project.image || project.photo || project.photoUrl || undefined
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message
  return fallback
}

async function loadData() {
  if (!companyId.value) return

  loading.value = true
  errorMessage.value = ''
  try {
    const [companiesResult, projectsResult] = await Promise.all([
      crmApi.listCompanies(),
      crmApi.listCompanyProjects(companyId.value),
    ])

    const companies = normalizeItems<CrmCompany>(companiesResult)
    const projectItems = normalizeItems<CrmProjectExtended>(projectsResult)

    company.value =
      companies.find((entry) => entry.id === companyId.value) ?? null
    companyMembershipIds.value = companies
      .filter((entry) => entry.role === 'owner' || entry.role === 'member')
      .map((entry) => entry.id)

    projects.value = projectItems

    if (!company.value) {
      errorMessage.value = 'Company introuvable ou non accessible.'
    }
  } catch (error) {
    errorMessage.value = getErrorMessage(
      error,
      'Erreur de chargement de la company.',
    )
  } finally {
    loading.value = false
  }
}

async function createProject() {
  if (!canCreateProjectInCompany.value) {
    Notify.error(PERMISSION_MESSAGES.createProject)
    return
  }

  if (!projectForm.name.trim()) {
    Notify.error('Le nom du projet est requis.')
    return
  }

  createLoading.value = true
  try {
    await crmApi.createProject({
      name: projectForm.name.trim(),
      description: projectForm.description.trim() || undefined,
      status: 'active',
    })

    projectForm.name = ''
    projectForm.description = ''
    createDialog.value = false
    Notify.success('Projet créé.')
    await loadData()
  } catch (error) {
    Notify.error(getErrorMessage(error, 'Erreur de création du projet.'))
  } finally {
    createLoading.value = false
  }
}

function openProject(projectId: string) {
  router.push(`/crm/projects/${projectId}`)
}

onMounted(loadData)
watch(companyId, loadData)
</script>

<template>
  <v-container fluid>
    <div class="d-flex align-center justify-space-between mb-4 flex-wrap ga-2">
      <div>
        <h1 class="text-h5">CRM · {{ getCompanyDisplayName(company) }}</h1>
        <p class="text-body-2 text-medium-emphasis">ID: {{ companyId }}</p>
      </div>
      <div class="d-flex ga-2">
        <v-btn variant="tonal" prepend-icon="mdi-arrow-left" to="/crm"
          >Companies</v-btn
        >
        <v-btn
          variant="tonal"
          prepend-icon="mdi-refresh"
          :loading="loading"
          @click="loadData"
          >Recharger</v-btn
        >
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          :disabled="!canCreateProjectInCompany"
          :title="
            canCreateProjectInCompany ? undefined : PERMISSION_MESSAGES.createProject
          "
          @click="createDialog = true"
        >
          Créer un projet
        </v-btn>
      </div>
    </div>

    <v-alert
      v-if="errorMessage"
      type="error"
      variant="tonal"
      :text="errorMessage"
      class="mb-4"
    />

    <v-card class="mb-4">
      <v-card-title>Détails company</v-card-title>
      <v-card-text>
        <v-skeleton-loader v-if="loading" type="article" />
        <template v-else>
          <div class="d-flex align-center ga-3 mb-2">
            <v-avatar size="40">
              <v-img
                v-if="getCompanyAvatar(company)"
                :src="getCompanyAvatar(company)"
                :alt="getCompanyDisplayName(company)"
              />
              <span v-else>{{ getCompanyDisplayName(company).slice(0, 1).toUpperCase() }}</span>
            </v-avatar>
            <p class="mb-0">
              <strong>Nom :</strong> {{ getCompanyDisplayName(company) || 'N/A' }}
            </p>
          </div>
          <p class="mb-2">
            <strong>Rôle :</strong> {{ company?.role || 'member' }}
          </p>
          <p class="mb-0">
            <strong>Description :</strong>
            {{ company?.description || 'Aucune description.' }}
          </p>
        </template>
      </v-card-text>
    </v-card>

    <v-row>
      <v-col
        v-for="project in projects"
        :key="project.id"
        cols="12"
        md="6"
        lg="4"
      >
        <v-card class="h-100" hover @click="openProject(project.id)">
          <v-card-title class="d-flex align-center justify-space-between ga-2">
            <div class="d-flex align-center ga-3 min-w-0">
              <v-avatar size="28">
                <v-img
                  v-if="getProjectAvatar(project)"
                  :src="getProjectAvatar(project)"
                  :alt="project.name"
                />
                <span v-else>{{ project.name.slice(0, 1).toUpperCase() }}</span>
              </v-avatar>
              <span class="text-truncate">{{ project.name }}</span>
            </div>
            <v-chip
              size="small"
              :color="project.status === 'active' ? 'success' : 'default'"
              variant="tonal"
            >
              {{ project.status }}
            </v-chip>
          </v-card-title>
          <v-card-text>
            {{ project.description || 'Aucune description projet.' }}
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-alert
      v-if="!loading && !projects.length"
      type="info"
      variant="tonal"
      text="Aucun projet lié à cette company."
      class="mt-4"
    />

    <v-dialog v-model="createDialog" max-width="560">
      <v-card>
        <v-card-title>Créer un projet</v-card-title>
        <v-card-text>
          <v-text-field v-model="projectForm.name" label="Nom" autofocus />
          <v-textarea
            v-model="projectForm.description"
            label="Description"
            rows="3"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            :disabled="createLoading"
            @click="createDialog = false"
            >Annuler</v-btn
          >
          <v-btn color="primary" :loading="createLoading" @click="createProject"
            >Créer</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
