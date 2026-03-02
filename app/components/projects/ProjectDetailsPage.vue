<script setup lang="ts">
import { useCrmApi, type CrmProject, type CrmTask, type CrmTaskStatus } from '~/composables/api/useCrmApi'
import { Notify } from '~/stores/notification'
import { useAuthStore } from '~/stores/auth'
import { canManageProject, canUpdateTaskStatus, type ProjectPermissionSubject, type TaskManagerUser } from '~/utils/permissions/task-manager'
import { PERMISSION_MESSAGES } from '~/utils/permissions/messages'

type ProjectDetailsState = 'loading' | 'empty' | 'error' | 'success'

interface ProjectTask {
  id: string
  title: string
  status: CrmTaskStatus
  assigneeId?: string | null
}

type CrmProjectExtended = CrmProject & {
  owner?: { id?: string } | string | null
  ownerId?: string | null
  managers?: Array<{ id?: string } | string> | null
}

type CrmTaskExtended = CrmTask & {
  assignee?: { id?: string } | string | null
  assigneeId?: string | null
  projectId?: string | null
}

const props = defineProps<{ projectId: string }>()
const { t } = useI18n()
const authStore = useAuthStore()
const crmApi = useCrmApi()

const state = ref<ProjectDetailsState>('loading')
const project = ref<ProjectPermissionSubject>({ ownerId: null, managerIds: [] })
const tasks = ref<ProjectTask[]>([])
const projectDeniedMessage = PERMISSION_MESSAGES.manageProject
const taskDeniedMessage = PERMISSION_MESSAGES.manageTask

const currentUser = computed<TaskManagerUser>(() => ({
  id: authStore.profile?.id ?? '99',
  roles: authStore.roles,
}))

function isForbiddenError(errorValue: unknown) {
  return Boolean(errorValue && typeof errorValue === 'object' && 'status' in errorValue && errorValue.status === 403)
}

function normalizeItems<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[]
  if (value && typeof value === 'object' && 'items' in value && Array.isArray((value as { items?: unknown }).items)) {
    return (value as { items: T[] }).items
  }
  if (value && typeof value === 'object' && 'data' in value && Array.isArray((value as { data?: unknown }).data)) {
    return (value as { data: T[] }).data
  }
  return []
}

function mapProjectPermissions(item: CrmProjectExtended): ProjectPermissionSubject {
  const ownerId =
    typeof item.ownerId === 'string'
      ? item.ownerId
      : item.owner && typeof item.owner === 'object'
        ? item.owner.id || null
        : typeof item.owner === 'string'
          ? item.owner
          : null

  const managerIds = Array.isArray(item.managers)
    ? item.managers
      .map((entry) => (typeof entry === 'string' ? entry : entry.id || ''))
      .filter(Boolean)
    : []

  return { ownerId, managerIds }
}

function mapTask(item: CrmTaskExtended): ProjectTask {
  const assigneeId =
    typeof item.assigneeId === 'string'
      ? item.assigneeId
      : item.assignee && typeof item.assignee === 'object'
        ? item.assignee.id || null
        : typeof item.assignee === 'string'
          ? item.assignee
          : null

  return {
    id: item.id,
    title: item.title,
    status: item.status,
    assigneeId,
  }
}

function taskBelongsToProject(task: CrmTaskExtended) {
  if (typeof task.projectId === 'string') return task.projectId === props.projectId
  if (task.project && !Array.isArray(task.project) && typeof task.project === 'object') {
    return String(task.project.id || '') === props.projectId
  }
  return false
}

async function editTask(task: ProjectTask) {
  if (!canUpdateTaskStatus(currentUser.value, task, project.value)) {
    Notify.error(taskDeniedMessage)
    return
  }

  try {
    await crmApi.patchTask(task.id, { status: task.status })
    Notify.success(String(useNuxtApp().$i18n.t('notifications.ui.taskEdited', { title: task.title })))
  } catch (errorValue) {
    if (isForbiddenError(errorValue)) {
      Notify.error(PERMISSION_MESSAGES.forbiddenPatch)
      return
    }
    Notify.error(String(useNuxtApp().$i18n.t('notifications.ui.taskEditFailed')))
  }
}

async function deleteTask(task: ProjectTask) {
  if (!canUpdateTaskStatus(currentUser.value, task, project.value)) {
    Notify.error(taskDeniedMessage)
    return
  }

  const previous = [...tasks.value]
  tasks.value = tasks.value.filter((entry) => entry.id !== task.id)

  try {
    await crmApi.deleteTask(task.id)
    Notify.success(String(useNuxtApp().$i18n.t('notifications.ui.taskDeletedWithTitle', { title: task.title })))
  } catch (errorValue) {
    tasks.value = previous
    if (isForbiddenError(errorValue)) {
      Notify.error(PERMISSION_MESSAGES.forbiddenDelete)
      return
    }
    Notify.error(String(useNuxtApp().$i18n.t('notifications.ui.taskDeleteFailed')))
  }
}

async function load() {
  if (!props.projectId) {
    state.value = 'empty'
    return
  }

  state.value = 'loading'

  try {
    const [projectResult, tasksResult] = await Promise.all([
      crmApi.getProject(props.projectId),
      crmApi.listTasks(),
    ])

    project.value = mapProjectPermissions(projectResult as CrmProjectExtended)
    tasks.value = normalizeItems<CrmTaskExtended>(tasksResult)
      .filter(taskBelongsToProject)
      .map(mapTask)

    state.value = tasks.value.length ? 'success' : 'empty'
  } catch {
    tasks.value = []
    state.value = 'error'
  }
}

watch(() => props.projectId, load, { immediate: true })
</script>

<template>
  <v-container class="py-6">
    <div class="d-flex align-center justify-space-between mb-4 ga-2 flex-wrap">
      <h1 class="text-h5">Projet {{ projectId }}</h1>
      <div class="d-flex ga-2 flex-wrap">
        <v-tooltip :text="canManageProject(currentUser, project) ? '' : projectDeniedMessage">
          <template #activator="{ props: tooltipProps }">
            <span v-bind="tooltipProps">
              <v-btn variant="tonal" color="primary" :disabled="!canManageProject(currentUser, project)">
                Gérer le projet
              </v-btn>
            </span>
          </template>
        </v-tooltip>
        <v-btn variant="text" prepend-icon="mdi-sync" @click="load">{{ t('common.reload') }}</v-btn>
      </div>
    </div>

    <div v-if="state === 'loading'" class="d-flex flex-column ga-3">
      <v-skeleton-loader type="article, list-item-three-line" />
      <v-progress-circular indeterminate color="primary" size="24" class="mx-auto" />
    </div>

    <v-alert v-else-if="state === 'empty'" type="info" variant="tonal" border="start">
      Ce projet ne contient encore aucune donnée affichable.
    </v-alert>

    <v-alert v-else-if="state === 'error'" type="error" variant="tonal" border="start">
      Une erreur est survenue lors du chargement du projet.
      <template #append>
        <v-btn size="small" color="error" variant="outlined" @click="load">Réessayer</v-btn>
      </template>
    </v-alert>

    <v-card v-else>
      <v-card-title>Détails du projet</v-card-title>
      <v-card-text>
        <p class="mb-3">Identifiant : <strong>{{ projectId }}</strong></p>
        <v-list density="compact" lines="one">
          <v-list-item
            v-for="task in tasks"
            :key="task.id"
            prepend-icon="mdi-check-circle-outline"
            :title="task.title"
            :subtitle="task.status"
            append-icon="mdi-chevron-right"
            :to="`/crm/tasks/${task.id}`"
          >
            <template #append>
              <div class="d-flex ga-2">
                <v-tooltip :text="canUpdateTaskStatus(currentUser, task, project) ? '' : taskDeniedMessage">
                  <template #activator="{ props: tooltipProps }">
                    <span v-bind="tooltipProps">
                      <v-btn size="x-small" variant="outlined" :disabled="!canUpdateTaskStatus(currentUser, task, project)" @click="editTask(task)">Edit</v-btn>
                    </span>
                  </template>
                </v-tooltip>
                <v-tooltip :text="canUpdateTaskStatus(currentUser, task, project) ? '' : taskDeniedMessage">
                  <template #activator="{ props: tooltipProps }">
                    <span v-bind="tooltipProps">
                      <v-btn size="x-small" variant="outlined" color="error" :disabled="!canUpdateTaskStatus(currentUser, task, project)" @click="deleteTask(task)">Delete</v-btn>
                    </span>
                  </template>
                </v-tooltip>
              </div>
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </v-container>
</template>
