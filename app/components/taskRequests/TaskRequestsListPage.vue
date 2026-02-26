<script setup lang="ts">
import { useCrmApi, type CrmProject, type CrmTask, type CrmTaskRequest } from '~/composables/api/useCrmApi'
import { Notify } from '~/stores/notification'
import { useAuthStore } from '~/stores/auth'
import {
  canCancelTaskRequest,
  canUpdateTaskRequestStatus,
  type ProjectPermissionSubject,
  type TaskManagerUser,
  type TaskPermissionSubject,
  type TaskRequestContext,
} from '~/utils/permissions/task-manager'
import { PERMISSION_MESSAGES } from '~/utils/permissions/messages'

type TaskRequestsState = 'loading' | 'empty' | 'error' | 'success'
type TaskRequestAction = 'approve' | 'reject' | 'cancel'

interface TaskRequestRow {
  id: string
  title: string
  requester: string
  requesterId: string
  priority: 'Low' | 'Medium' | 'High'
  status: 'pending' | 'approved' | 'rejected' | 'canceled'
  taskId: string
  projectId: string | null
  task: TaskPermissionSubject
  project: ProjectPermissionSubject
}

type CrmTaskExtended = CrmTask & {
  assignee?: { id?: string } | string | null
  assigneeId?: string | null
  projectId?: string | null
}

type CrmProjectExtended = CrmProject & {
  owner?: { id?: string } | string | null
  ownerId?: string | null
  managers?: Array<{ id?: string } | string> | null
}

type CrmTaskRequestExtended = CrmTaskRequest & {
  requester?: { id?: string; name?: string } | string | null
  requesterId?: string | null
}

const authStore = useAuthStore()
const router = useRouter()
const crmApi = useCrmApi()
const state = ref<TaskRequestsState>('loading')
const rows = ref<TaskRequestRow[]>([])

const actionDeniedMessage = PERMISSION_MESSAGES.updateTaskRequestStatus

const currentUser = computed<TaskManagerUser>(() => ({
  id: authStore.profile?.id ?? '99',
  roles: authStore.roles,
}))

const headers = [
  { title: 'Demande', key: 'title' },
  { title: 'Demandeur', key: 'requester' },
  { title: 'Priorité', key: 'priority' },
  { title: 'Actions', key: 'actions', sortable: false },
]

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

function resolveTaskId(task: CrmTaskRequest['task']) {
  if (typeof task === 'string') return task
  if (task && typeof task === 'object' && 'id' in task) return String(task.id || '')
  return ''
}

function resolveTaskProjectId(task: CrmTaskExtended) {
  if (typeof task.projectId === 'string') return task.projectId
  if (task.project && !Array.isArray(task.project) && typeof task.project === 'object') {
    return String(task.project.id || '')
  }
  return ''
}

function resolveAssigneeId(task: CrmTaskExtended) {
  if (typeof task.assigneeId === 'string') return task.assigneeId
  if (task.assignee && typeof task.assignee === 'object') return task.assignee.id || null
  if (typeof task.assignee === 'string') return task.assignee
  return null
}

function resolveOwnerId(project: CrmProjectExtended) {
  if (typeof project.ownerId === 'string') return project.ownerId
  if (project.owner && typeof project.owner === 'object') return project.owner.id || null
  if (typeof project.owner === 'string') return project.owner
  return null
}

function resolveManagerIds(project: CrmProjectExtended) {
  if (!Array.isArray(project.managers)) return []
  return project.managers
    .map((entry) => (typeof entry === 'string' ? entry : entry.id || ''))
    .filter(Boolean)
}

function mapPriority(priority: string): TaskRequestRow['priority'] {
  if (priority === 'high' || priority === 'critical') return 'High'
  if (priority === 'medium') return 'Medium'
  return 'Low'
}

function mapStatus(status: CrmTaskRequest['status']): TaskRequestRow['status'] {
  if (status === 'cancelled') return 'canceled'
  return status
}

function mapRequester(taskRequest: CrmTaskRequestExtended) {
  if (taskRequest.requester && typeof taskRequest.requester === 'object') {
    return {
      name: taskRequest.requester.name || taskRequest.requester.id || 'N/A',
      id: taskRequest.requester.id || '',
    }
  }
  if (typeof taskRequest.requester === 'string') {
    return { name: taskRequest.requester, id: taskRequest.requester }
  }
  if (typeof taskRequest.requesterId === 'string') {
    return { name: taskRequest.requesterId, id: taskRequest.requesterId }
  }
  return { name: 'N/A', id: '' }
}

async function load() {
  state.value = 'loading'

  try {
    const [requestsResult, tasksResult, projectsResult] = await Promise.all([
      crmApi.listTaskRequests(),
      crmApi.listTasks(),
      crmApi.listProjects(),
    ])

    const tasks = normalizeItems<CrmTaskExtended>(tasksResult)
    const projects = normalizeItems<CrmProjectExtended>(projectsResult)
    const requests = normalizeItems<CrmTaskRequestExtended>(requestsResult)

    const tasksById = new Map(tasks.map((task) => [task.id, task]))
    const projectsById = new Map(projects.map((project) => [project.id, project]))

    rows.value = requests.map((request) => {
      const taskId = resolveTaskId(request.task)
      const task = tasksById.get(taskId)
      const projectId = task ? resolveTaskProjectId(task) : ''
      const project = projectsById.get(projectId)
      const requester = mapRequester(request)

      return {
        id: request.id,
        title: task?.title || `Task ${taskId}`,
        requester: requester.name,
        requesterId: requester.id,
        priority: mapPriority(task?.priority || 'low'),
        status: mapStatus(request.status),
        taskId,
        projectId: projectId || null,
        task: { assigneeId: task ? resolveAssigneeId(task) : null },
        project: {
          ownerId: project ? resolveOwnerId(project) : null,
          managerIds: project ? resolveManagerIds(project) : [],
        },
      }
    })

    state.value = rows.value.length ? 'success' : 'empty'
  } catch {
    rows.value = []
    state.value = 'error'
  }
}

function isForbiddenError(errorValue: unknown) {
  return Boolean(errorValue && typeof errorValue === 'object' && 'status' in errorValue && errorValue.status === 403)
}

function canAction(row: TaskRequestRow, action: TaskRequestAction) {
  const context: TaskRequestContext = { task: row.task, project: row.project }

  if (action === 'cancel') {
    return canCancelTaskRequest(currentUser.value, row)
  }

  return canUpdateTaskRequestStatus(currentUser.value, row, context)
}

function nextStatus(action: TaskRequestAction): TaskRequestRow['status'] {
  if (action === 'approve') return 'approved'
  if (action === 'reject') return 'rejected'
  return 'canceled'
}

function actionLabel(action: TaskRequestAction) {
  return {
    approve: 'Approve',
    reject: 'Reject',
    cancel: 'Cancel',
  }[action]
}

async function runAction(row: TaskRequestRow, action: TaskRequestAction) {
  if (!canAction(row, action)) {
    Notify.error(actionDeniedMessage)
    return
  }

  const previous = row.status
  row.status = nextStatus(action)

  try {
    if (action === 'approve') await crmApi.approveTaskRequest(row.id)
    if (action === 'reject') await crmApi.rejectTaskRequest(row.id)
    if (action === 'cancel') await crmApi.cancelTaskRequest(row.id)
    Notify.success(`Demande ${actionLabel(action)}.`)
  } catch (errorValue) {
    row.status = previous
    if (isForbiddenError(errorValue)) {
      Notify.error(PERMISSION_MESSAGES.forbiddenTaskRequestStatus)
      return
    }
    Notify.error('Le traitement de la demande a échoué.')
  }
}

function openRow(row: TaskRequestRow) {
  if (row.taskId) {
    router.push(`/crm/tasks/${row.taskId}`)
    return
  }

  if (row.projectId) {
    router.push(`/crm/projects/${row.projectId}`)
  }
}

onMounted(load)
</script>

<template>
  <v-container class="py-6">
    <div class="d-flex align-center justify-space-between mb-4 ga-2 flex-wrap">
      <h1 class="text-h5">Task requests</h1>
      <div class="d-flex ga-2 flex-wrap">
        <v-btn variant="text" prepend-icon="mdi-sync" @click="load">Reload</v-btn>
      </div>
    </div>

    <div v-if="state === 'loading'" class="d-flex flex-column ga-3">
      <v-skeleton-loader type="table-heading, table-row-divider@3" />
      <v-progress-circular indeterminate color="primary" size="24" class="mx-auto" />
    </div>

    <v-alert v-else-if="state === 'empty'" type="info" variant="tonal" border="start">
      Aucune demande de tâche en attente.
    </v-alert>

    <v-alert v-else-if="state === 'error'" type="error" variant="tonal" border="start">
      Le chargement des demandes a échoué.
      <template #append>
        <v-btn size="small" color="error" variant="outlined" @click="load">Réessayer</v-btn>
      </template>
    </v-alert>

    <v-data-table v-else :headers="headers" :items="rows" item-value="id" class="elevation-1" hover>
      <template #item.title="{ item }">
        <v-btn variant="text" size="small" class="px-0 text-none" @click="openRow(item)">{{ item.title }}</v-btn>
      </template>
      <template #item.actions="{ item }">
        <div class="d-flex ga-2 flex-wrap justify-end">
          <template v-for="action in ['approve', 'reject', 'cancel'] as TaskRequestAction[]" :key="`${item.id}-${action}`">
            <v-tooltip :text="canAction(item, action) ? '' : actionDeniedMessage" location="top">
              <template #activator="{ props: tooltipProps }">
                <span v-bind="tooltipProps">
                  <v-btn
                    size="x-small"
                    variant="outlined"
                    :color="action === 'reject' ? 'error' : undefined"
                    :disabled="!canAction(item, action) || item.status !== 'pending'"
                    @click="runAction(item, action)"
                  >
                    {{ actionLabel(action) }}
                  </v-btn>
                </span>
              </template>
            </v-tooltip>
          </template>
        </div>
      </template>
    </v-data-table>
  </v-container>
</template>
