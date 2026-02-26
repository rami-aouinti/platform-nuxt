<script setup lang="ts">
import { Notify } from '~/stores/notification'
import { useCrmApi } from '~/composables/api/useCrmApi'
import type { CrmProject, CrmTask } from '~/composables/api/useCrmApi'

type CrmProjectExtended = CrmProject & {
  company?: { id?: string; role?: string } | string | null
  companyId?: string | null
  permissions?: { canCreateTask?: boolean } | null
  canCreateTask?: boolean
}

type CrmTaskExtended = CrmTask & {
  projectId?: string | null
}

const route = useRoute()
const router = useRouter()
const crmApi = useCrmApi()

definePageMeta({
  icon: 'mdi-briefcase-outline',
  title: 'CRM · Projet',
  requiresAuth: true,
  middleware: ['auth'],
})

const projectId = computed(() =>
  String((route.params as { projectId?: string }).projectId || ''),
)
const loading = ref(false)
const createLoading = ref(false)
const project = ref<CrmProjectExtended | null>(null)
const tasks = ref<CrmTaskExtended[]>([])
const errorMessage = ref('')
const createDialog = ref(false)

const taskForm = reactive({
  title: '',
  description: '',
  priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
})

const statusLabels: Record<string, string> = {
  todo: 'À faire',
  in_progress: 'En cours',
  done: 'Terminé',
  archived: 'Archivé',
}

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

function resolveTaskProjectId(task: CrmTaskExtended): string {
  if (typeof task.projectId === 'string') return task.projectId
  if (
    task.project &&
    !Array.isArray(task.project) &&
    typeof task.project === 'object'
  ) {
    return String(task.project.id ?? '')
  }
  return ''
}

const canCreateTask = computed(() => {
  if (!project.value) return false
  if (typeof project.value.canCreateTask === 'boolean')
    return project.value.canCreateTask
  if (
    project.value.permissions &&
    typeof project.value.permissions.canCreateTask === 'boolean'
  ) {
    return project.value.permissions.canCreateTask
  }
  return true
})

const companyLink = computed(() => {
  if (!project.value) return '/crm'
  if (typeof project.value.companyId === 'string' && project.value.companyId) {
    return `/crm/companies/${project.value.companyId}`
  }
  if (project.value.company && typeof project.value.company === 'string') {
    return `/crm/companies/${project.value.company}`
  }
  if (
    project.value.company &&
    typeof project.value.company === 'object' &&
    project.value.company.id
  ) {
    return `/crm/companies/${project.value.company.id}`
  }
  return '/crm'
})

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message
  return fallback
}

async function loadData() {
  if (!projectId.value) return

  loading.value = true
  errorMessage.value = ''
  try {
    const [projectResult, tasksResult] = await Promise.all([
      crmApi.getProject(projectId.value),
      crmApi.listTasks(),
    ])

    project.value = projectResult as CrmProjectExtended
    const taskItems = normalizeItems<CrmTaskExtended>(tasksResult)
    tasks.value = taskItems.filter(
      (entry) => resolveTaskProjectId(entry) === projectId.value,
    )
  } catch (error) {
    errorMessage.value = getErrorMessage(
      error,
      'Erreur de chargement du projet.',
    )
  } finally {
    loading.value = false
  }
}

async function createTask() {
  if (!taskForm.title.trim()) {
    Notify.error('Le titre de la task est requis.')
    return
  }

  createLoading.value = true
  try {
    await crmApi.createTask({
      title: taskForm.title.trim(),
      description: taskForm.description.trim() || undefined,
      priority: taskForm.priority,
      status: 'todo',
      project: projectId.value,
    })

    taskForm.title = ''
    taskForm.description = ''
    taskForm.priority = 'medium'
    createDialog.value = false
    Notify.success('Task créée.')
    await loadData()
  } catch (error) {
    Notify.error(getErrorMessage(error, 'Erreur de création task.'))
  } finally {
    createLoading.value = false
  }
}

function openTask(taskId: string) {
  router.push(`/crm/tasks/${taskId}`)
}

onMounted(loadData)
watch(projectId, loadData)
</script>

<template>
  <v-container fluid>
    <div class="d-flex align-center justify-space-between mb-4 flex-wrap ga-2">
      <div>
        <h1 class="text-h5">CRM · Projet {{ project?.name || '' }}</h1>
        <p class="text-body-2 text-medium-emphasis">ID: {{ projectId }}</p>
      </div>
      <div class="d-flex ga-2">
        <v-btn variant="tonal" prepend-icon="mdi-domain" :to="companyLink">
          Company
        </v-btn>
        <v-btn
          variant="tonal"
          prepend-icon="mdi-view-kanban-outline"
          :to="`/crm/kanban?projectId=${projectId}`"
        >
          Kanban projet
        </v-btn>
        <v-btn
          variant="tonal"
          prepend-icon="mdi-refresh"
          :loading="loading"
          @click="loadData"
          >Recharger</v-btn
        >
        <v-btn
          v-if="canCreateTask"
          color="primary"
          prepend-icon="mdi-plus"
          @click="createDialog = true"
          >Créer une task</v-btn
        >
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
      <v-card-title>Détails projet</v-card-title>
      <v-card-text>
        <v-skeleton-loader v-if="loading" type="article" />
        <template v-else>
          <p class="mb-2">
            <strong>Nom :</strong> {{ project?.name || 'N/A' }}
          </p>
          <p class="mb-2">
            <strong>Statut :</strong> {{ project?.status || 'N/A' }}
          </p>
          <p class="mb-0">
            <strong>Description :</strong>
            {{ project?.description || 'Aucune description.' }}
          </p>
        </template>
      </v-card-text>
    </v-card>

    <v-list lines="two" class="rounded border">
      <v-list-subheader>Tasks liées</v-list-subheader>
      <v-list-item
        v-for="task in tasks"
        :key="task.id"
        :title="task.title"
        :subtitle="`${statusLabels[task.status] || task.status} · Priorité ${task.priority}`"
        append-icon="mdi-chevron-right"
        @click="openTask(task.id)"
      />
      <v-list-item
        v-if="!loading && !tasks.length"
        title="Aucune task liée à ce projet."
      />
    </v-list>

    <v-dialog v-model="createDialog" max-width="560">
      <v-card>
        <v-card-title>Créer une task</v-card-title>
        <v-card-text>
          <v-text-field v-model="taskForm.title" label="Titre" autofocus />
          <v-textarea
            v-model="taskForm.description"
            label="Description"
            rows="3"
          />
          <v-select
            v-model="taskForm.priority"
            :items="['low', 'medium', 'high', 'critical']"
            label="Priorité"
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
          <v-btn color="primary" :loading="createLoading" @click="createTask"
            >Créer</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
