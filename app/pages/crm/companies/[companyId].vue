<script setup lang="ts">
import { Notify } from '~/stores/notification'
import { useCrmApi } from '~/composables/api/useCrmApi'
import { useAuthStore } from '~/stores/auth'
import type {
  CrmCompany,
  CrmProject,
  CrmSprint,
  CrmCompanyMember,
  CreateSprintPayload,
} from '~/composables/api/useCrmApi'
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
const sprints = ref<CrmSprint[]>([])
const companyMembers = ref<CrmCompanyMember[]>([])
const errorMessage = ref('')
const createDialog = ref(false)
const createSprintDialog = ref(false)
const createSprintLoading = ref(false)

const projectForm = reactive({
  name: '',
  description: '',
})

const sprintForm = reactive<CreateSprintPayload>({
  name: '',
  project: '',
  goal: '',
  status: 'planned',
  startDate: '',
  endDate: '',
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

function sprintProjectName(sprint: CrmSprint) {
  if (!sprint.project) return 'Projet inconnu'
  if (typeof sprint.project === 'string') return sprint.project
  return sprint.project.name || sprint.project.id || 'Projet inconnu'
}


function memberLabel(member: CrmCompanyMember) {
  const fullName = [member.firstName, member.lastName].filter(Boolean).join(' ').trim()
  return fullName || member.username || member.email || member.id
}

function openSprint(sprintId: string) {
  router.push(`/crm/kanban?sprintId=${encodeURIComponent(sprintId)}`)
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message
  return fallback
}

function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10)
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function toIsoDateTime(dateInput: string, endOfDay = false) {
  if (!dateInput) return ''
  if (dateInput.includes('T')) return dateInput
  const date = new Date(`${dateInput}T00:00:00`)
  if (endOfDay) {
    date.setHours(23, 59, 59, 0)
  }
  return date.toISOString()
}

function resetSprintDates() {
  const start = new Date()
  const end = addDays(start, 14)
  sprintForm.startDate = formatDateInput(start)
  sprintForm.endDate = formatDateInput(end)
}

async function loadData() {
  if (!companyId.value) return

  loading.value = true
  errorMessage.value = ''
  try {
    const [companiesResult, projectsResult, sprintsResult, membersResult] = await Promise.all([
      crmApi.listCompanies(),
      crmApi.listCompanyProjects(companyId.value),
      crmApi.listCompanySprints(companyId.value),
      crmApi.listCompanyMembers(companyId.value),
    ])

    const companies = normalizeItems<CrmCompany>(companiesResult)
    const projectItems = normalizeItems<CrmProjectExtended>(projectsResult)
    const sprintItems = normalizeItems<CrmSprint>(sprintsResult)
    const memberItems = normalizeItems<CrmCompanyMember>(membersResult)

    company.value =
      companies.find((entry) => entry.id === companyId.value) ?? null
    companyMembershipIds.value = companies
      .filter((entry) => entry.role === 'owner' || entry.role === 'member')
      .map((entry) => entry.id)

    projects.value = projectItems
    sprints.value = sprintItems
    companyMembers.value = memberItems

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

async function createSprint() {
  if (!sprintForm.name.trim()) {
    Notify.error('Le nom du sprint est requis.')
    return
  }

  if (!sprintForm.project) {
    Notify.error('Veuillez sélectionner un projet.')
    return
  }

  if (!sprintForm.startDate || !sprintForm.endDate) {
    Notify.error('Les dates de début et de fin sont requises.')
    return
  }

  if (new Date(sprintForm.endDate) < new Date(sprintForm.startDate)) {
    Notify.error('La date de fin doit être postérieure à la date de début.')
    return
  }

  createSprintLoading.value = true
  try {
    await crmApi.createSprint({
      name: sprintForm.name.trim(),
      project: sprintForm.project,
      goal: sprintForm.goal?.trim() || undefined,
      status: sprintForm.status || undefined,
      startDate: toIsoDateTime(sprintForm.startDate),
      endDate: toIsoDateTime(sprintForm.endDate, true),
    })

    sprintForm.name = ''
    sprintForm.project = projects.value[0]?.id || ''
    sprintForm.goal = ''
    sprintForm.status = 'planned'
    resetSprintDates()
    createSprintDialog.value = false
    Notify.success('Sprint créé.')
    await loadData()
  } catch (error) {
    Notify.error(getErrorMessage(error, 'Erreur de création du sprint.'))
  } finally {
    createSprintLoading.value = false
  }
}

resetSprintDates()

onMounted(loadData)
watch(companyId, loadData)

watch(createSprintDialog, (value) => {
  if (value && (!sprintForm.startDate || !sprintForm.endDate)) {
    resetSprintDates()
  }
})

watch(
  projects,
  (value) => {
    if (!value.length) {
      sprintForm.project = ''
      return
    }
    if (
      !sprintForm.project ||
      !value.some((project) => project.id === sprintForm.project)
    ) {
      const firstProject = value[0]
      sprintForm.project = firstProject ? firstProject.id : ''
    }
  },
  { immediate: true },
)
</script>

<template>
  <v-container fluid>
    <client-only>
      <teleport to="#app-bar">
        <div class="d-flex ga-2 flex-wrap">
          <v-btn variant="tonal" prepend-icon="mdi-arrow-left" to="/crm">Companies</v-btn>
          <v-btn
            variant="tonal"
            prepend-icon="mdi-refresh"
            :loading="loading"
            @click="loadData"
          >
            Recharger
          </v-btn>
          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            :disabled="!canCreateProjectInCompany"
            :title="
              canCreateProjectInCompany
                ? undefined
                : PERMISSION_MESSAGES.createProject
            "
            @click="createDialog = true"
          >
            Créer un projet
          </v-btn>
          <v-btn
            color="secondary"
            prepend-icon="mdi-calendar-plus"
            :disabled="!projects.length"
            @click="createSprintDialog = true"
          >
            Ajouter un sprint
          </v-btn>
        </div>
      </teleport>
    </client-only>

    <v-alert
      v-if="errorMessage"
      type="error"
      variant="tonal"
      :text="errorMessage"
      class="mb-4"
    />

    <v-row>
      <v-col cols="12" md="9">
        <v-row class="mb-6">
          <v-col
            v-for="project in projects"
            :key="project.id"
            cols="12"
            md="6"
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

        <v-row v-if="sprints.length">
          <v-col
            v-for="sprint in sprints"
            :key="sprint.id"
            cols="12"
            md="6"
          >
            <v-card variant="outlined" class="h-100" hover @click="openSprint(sprint.id)">
              <v-card-title class="d-flex justify-space-between align-center ga-2">
                <span class="text-truncate">{{ sprint.name || sprint.id }}</span>
                <v-chip size="small" variant="tonal">{{ sprint.status || 'planned' }}</v-chip>
              </v-card-title>
              <v-card-text>
                <p class="mb-1"><strong>Projet :</strong> {{ sprintProjectName(sprint) }}</p>
                <p class="mb-0"><strong>Objectif :</strong> {{ sprint.goal || 'Aucun objectif.' }}</p>
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
      </v-col>

      <v-col cols="12" md="3">
        <v-card>
          <v-card-title>{{ getCompanyDisplayName(company) }}</v-card-title>
          <v-card-text>
            <div class="d-flex align-center ga-3 mb-3">
              <v-avatar size="40">
                <v-img
                  v-if="getCompanyAvatar(company)"
                  :src="getCompanyAvatar(company)"
                  :alt="getCompanyDisplayName(company)"
                />
                <span v-else>{{ getCompanyDisplayName(company).slice(0, 1).toUpperCase() }}</span>
              </v-avatar>
              <v-chip size="small" variant="tonal">{{ company?.role || 'member' }}</v-chip>
            </div>
            <p class="mb-3">{{ company?.description || 'Aucune description.' }}</p>
            <div>
              <p class="text-caption text-medium-emphasis mb-2">Members</p>
              <v-chip
                v-for="member in companyMembers"
                :key="member.id"
                size="small"
                class="ma-1"
                variant="outlined"
              >
                {{ memberLabel(member) }}
              </v-chip>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

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

    <v-dialog v-model="createSprintDialog" max-width="640">
      <v-card>
        <v-card-title>Ajouter un sprint</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="sprintForm.name"
            label="Nom du sprint"
            autofocus
          />
          <v-select
            v-model="sprintForm.project"
            label="Projet"
            :items="projects"
            item-title="name"
            item-value="id"
          />
          <v-textarea v-model="sprintForm.goal" label="Objectif" rows="3" />
          <v-text-field v-model="sprintForm.status" label="Statut" />
          <v-text-field
            v-model="sprintForm.startDate"
            label="Date de début"
            type="date"
            required
          />
          <v-text-field
            v-model="sprintForm.endDate"
            label="Date de fin"
            type="date"
            required
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            :disabled="createSprintLoading"
            @click="createSprintDialog = false"
            >Annuler</v-btn
          >
          <v-btn
            color="primary"
            :loading="createSprintLoading"
            @click="createSprint"
            >Créer</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
