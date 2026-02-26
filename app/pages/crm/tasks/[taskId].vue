<script setup lang="ts">
import { Notify } from '~/stores/notification'
import { useCrmApi } from '~/composables/api/useCrmApi'
import { useAuthStore } from '~/stores/auth'
import type {
  CrmTask,
  CrmTaskRequest,
  CrmTaskStatus,
} from '~/composables/api/useCrmApi'
import { PERMISSION_MESSAGES } from '~/utils/permissions/messages'
import {
  canCreateTaskRequest,
  canManageTask,
  canUpdateTaskStatus,
  canUpdateTaskRequestStatus,
  type ProjectPermissionSubject,
  type TaskManagerUser,
  type TaskPermissionSubject,
  type TaskRequestPermissionSubject,
} from '~/utils/permissions/task-manager'
import { TaskRequestStatus, TaskStatus } from '~/types/task-manager'

type CrmTaskExtended = CrmTask & {
  projectId?: string | null
  assignee?: { id?: string } | string | null
  assigneeId?: string | null
  project?:
    | {
      id?: string
      name?: string
      owner?: { id?: string } | string | null
      ownerId?: string | null
      managers?: Array<{ id?: string } | string> | null
      company?: { id?: string } | string | null
      companyId?: string | null
    }
    | null
    | []
}

type CrmTaskRequestExtended = CrmTaskRequest & {
  requester?: { id?: string; name?: string } | string | null
  requesterId?: string | null
}

const route = useRoute()
const crmApi = useCrmApi()
const authStore = useAuthStore()

definePageMeta({
  icon: 'mdi-format-list-checks',
  title: 'CRM · Task',
  requiresAuth: true,
  middleware: ['auth'],
})

const taskId = computed(() =>
  String((route.params as { taskId?: string }).taskId || ''),
)
const loading = ref(false)
const requestLoading = ref(false)
const taskLoading = ref(false)
const task = ref<CrmTaskExtended | null>(null)
const requests = ref<CrmTaskRequestExtended[]>([])
const errorMessage = ref('')

const createDialog = ref(false)
const editDialog = ref(false)
const taskEditDialog = ref(false)
const editedRequest = ref<CrmTaskRequestExtended | null>(null)

const createRequestFormRef = ref()
const editRequestFormRef = ref()

const taskForm = reactive({
  title: '',
  description: '',
  priority: 'medium' as CrmTask['priority'],
  dueDate: '',
})

const requestForm = reactive({
  requestedStatus: 'in_progress' as CrmTaskStatus,
  note: '',
})

const requestStatuses = ['pending', 'approved', 'rejected', 'cancelled'] as const
const requestedTaskStatuses: CrmTaskStatus[] = ['todo', 'in_progress', 'done', 'archived']

const requestStatusLabels: Record<(typeof requestStatuses)[number], string> = {
  pending: 'En attente',
  approved: 'Approuvée',
  rejected: 'Rejetée',
  cancelled: 'Annulée',
}

const requestRules = {
  requestedStatus: [(value: string) => Boolean(value) || 'Le statut demandé est requis.'],
  note: [(value: string) => !value || value.length <= 600 || 'La note ne peut pas dépasser 600 caractères.'],
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

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message
  return fallback
}

function resolveRequesterId(request: CrmTaskRequestExtended): string | null {
  if (typeof request.requesterId === 'string') return request.requesterId
  if (request.requester && typeof request.requester === 'string') {
    return request.requester
  }
  if (request.requester && typeof request.requester === 'object') {
    return request.requester.id || null
  }
  return null
}

function resolveAssigneeId(taskValue: CrmTaskExtended | null): string | null {
  if (!taskValue) return null
  if (typeof taskValue.assigneeId === 'string') return taskValue.assigneeId
  if (taskValue.assignee && typeof taskValue.assignee === 'string') {
    return taskValue.assignee
  }
  if (taskValue.assignee && typeof taskValue.assignee === 'object') {
    return taskValue.assignee.id || null
  }
  return null
}

function resolveProjectSubject(taskValue: CrmTaskExtended | null): ProjectPermissionSubject {
  const rawProject = taskValue?.project
  if (!rawProject || Array.isArray(rawProject)) {
    return { ownerId: null, managerIds: [], companyId: null }
  }

  const ownerId =
    typeof rawProject.ownerId === 'string'
      ? rawProject.ownerId
      : typeof rawProject.owner === 'string'
        ? rawProject.owner
        : rawProject.owner && typeof rawProject.owner === 'object'
          ? rawProject.owner.id || null
          : null

  const managerIds = Array.isArray(rawProject.managers)
    ? rawProject.managers
      .map((entry) => (typeof entry === 'string' ? entry : entry.id || ''))
      .filter(Boolean)
    : []

  const companyId =
    typeof rawProject.companyId === 'string'
      ? rawProject.companyId
      : rawProject.company && typeof rawProject.company === 'string'
        ? rawProject.company
        : rawProject.company && typeof rawProject.company === 'object'
          ? rawProject.company.id || null
          : null

  return {
    ownerId,
    managerIds,
    companyId,
  }
}

function resetRequestForm() {
  requestForm.requestedStatus = 'in_progress'
  requestForm.note = ''
}

function toTaskChipStatus(status?: CrmTaskStatus | null): TaskStatus {
  if (status === 'done') return TaskStatus.COMPLETED
  if (status === 'archived') return TaskStatus.ARCHIVED
  if (status === 'in_progress') return TaskStatus.IN_PROGRESS
  return TaskStatus.TODO
}

function toRequestChipStatus(status: CrmTaskRequest['status']): TaskRequestStatus {
  if (status === 'approved') return TaskRequestStatus.APPROVED
  if (status === 'rejected') return TaskRequestStatus.REJECTED
  if (status === 'cancelled') return TaskRequestStatus.CANCELED
  return TaskRequestStatus.PENDING
}

const currentUser = computed<TaskManagerUser>(() => ({
  id: authStore.profile?.id ?? null,
  roles: authStore.roles,
}))

const taskSubject = computed<TaskPermissionSubject>(() => ({
  assigneeId: resolveAssigneeId(task.value),
}))

const projectSubject = computed<ProjectPermissionSubject>(() =>
  resolveProjectSubject(task.value),
)

const canManageCurrentTask = computed(() =>
  canManageTask(currentUser.value, taskSubject.value, projectSubject.value),
)
const canChangeTaskStatus = computed(() =>
  canUpdateTaskStatus(currentUser.value, taskSubject.value, projectSubject.value),
)
const canCreateRequest = computed(() =>
  canCreateTaskRequest(currentUser.value, taskSubject.value, projectSubject.value),
)
const canEditRequest = computed(() =>
  canManageTask(currentUser.value, taskSubject.value, projectSubject.value),
)
const canDeleteRequest = computed(() =>
  canManageTask(currentUser.value, taskSubject.value, projectSubject.value),
)

const projectId = computed(() => {
  const rawProject = task.value?.project
  if (!rawProject || Array.isArray(rawProject)) return ''
  return String(rawProject.id ?? '')
})

const projectLink = computed(() => (projectId.value ? `/crm/projects/${projectId.value}` : '/crm'))
const projectKanbanLink = computed(() =>
  projectId.value ? `/crm/kanban?projectId=${projectId.value}` : '/crm/kanban',
)

function canUpdateSingleRequestStatus(request: CrmTaskRequestExtended) {
  const requestSubject: TaskRequestPermissionSubject = {
    requesterId: resolveRequesterId(request),
  }

  return canUpdateTaskRequestStatus(currentUser.value, requestSubject, {
    task: taskSubject.value,
    project: projectSubject.value,
  })
}

async function loadData() {
  if (!taskId.value) return

  loading.value = true
  errorMessage.value = ''
  try {
    const [taskResult, requestsResult] = await Promise.all([
      crmApi.getTask(taskId.value),
      crmApi.listTaskTaskRequests(taskId.value),
    ])

    task.value = taskResult as CrmTaskExtended
    taskForm.title = task.value?.title || ''
    taskForm.description = task.value?.description || ''
    taskForm.priority = task.value?.priority || 'medium'
    taskForm.dueDate = task.value?.dueDate || ''

    requests.value = normalizeItems<CrmTaskRequestExtended>(requestsResult)
  } catch (error) {
    errorMessage.value = getErrorMessage(
      error,
      'Erreur de chargement de la task.',
    )
  } finally {
    loading.value = false
  }
}

async function createRequest() {
  if (!canCreateRequest.value) {
    Notify.error(PERMISSION_MESSAGES.createTaskRequest)
    return
  }

  const validation = await createRequestFormRef.value?.validate?.()
  if (validation && !validation.valid) return

  requestLoading.value = true
  try {
    await crmApi.createTaskRequest({
      task: taskId.value,
      type: 'status_change',
      requestedStatus: requestForm.requestedStatus,
      note: requestForm.note.trim() || undefined,
    })
    createDialog.value = false
    resetRequestForm()
    Notify.success('Request créée.')
    await loadData()
  } catch (error) {
    Notify.error(getErrorMessage(error, 'Erreur de création de request.'))
  } finally {
    requestLoading.value = false
  }
}

function openEditRequest(request: CrmTaskRequestExtended) {
  if (!canEditRequest.value) {
    Notify.error(PERMISSION_MESSAGES.updateTaskRequest)
    return
  }

  editedRequest.value = request
  requestForm.requestedStatus = request.requestedStatus ?? 'in_progress'
  requestForm.note = request.note ?? ''
  editDialog.value = true
}

async function updateRequest() {
  if (!editedRequest.value) return

  if (!canEditRequest.value) {
    Notify.error(PERMISSION_MESSAGES.updateTaskRequest)
    return
  }

  const validation = await editRequestFormRef.value?.validate?.()
  if (validation && !validation.valid) return

  requestLoading.value = true
  try {
    await crmApi.patchTaskRequest(editedRequest.value.id, {
      requestedStatus: requestForm.requestedStatus,
      note: requestForm.note.trim() || undefined,
    })
    editDialog.value = false
    editedRequest.value = null
    resetRequestForm()
    Notify.success('Request mise à jour.')
    await loadData()
  } catch (error) {
    Notify.error(getErrorMessage(error, 'Erreur mise à jour request.'))
  } finally {
    requestLoading.value = false
  }
}

async function removeRequest(requestId: string) {
  if (!canDeleteRequest.value) {
    Notify.error(PERMISSION_MESSAGES.updateTaskRequest)
    return
  }

  requestLoading.value = true
  try {
    await crmApi.deleteTaskRequest(requestId)
    Notify.success('Request supprimée.')
    await loadData()
  } catch (error) {
    Notify.error(getErrorMessage(error, 'Erreur suppression request.'))
  } finally {
    requestLoading.value = false
  }
}

async function changeRequestStatus(
  request: CrmTaskRequestExtended,
  status: (typeof requestStatuses)[number],
) {
  if (!canUpdateSingleRequestStatus(request)) {
    Notify.error(PERMISSION_MESSAGES.updateTaskRequestStatus)
    return
  }

  requestLoading.value = true
  try {
    if (status === 'approved') await crmApi.approveTaskRequest(request.id)
    if (status === 'rejected') await crmApi.rejectTaskRequest(request.id)
    if (status === 'cancelled') await crmApi.cancelTaskRequest(request.id)
    if (status === 'pending') {
      Notify.info('Le statut pending est un état initial, aucun endpoint dédié.')
      requestLoading.value = false
      return
    }
    Notify.success(`Request ${status}.`)
    await loadData()
  } catch (error) {
    Notify.error(getErrorMessage(error, 'Erreur changement statut request.'))
  } finally {
    requestLoading.value = false
  }
}

function openTaskEditDialog() {
  if (!canManageCurrentTask.value) {
    Notify.error(PERMISSION_MESSAGES.manageTask)
    return
  }

  taskForm.title = task.value?.title || ''
  taskForm.description = task.value?.description || ''
  taskForm.priority = task.value?.priority || 'medium'
  taskForm.dueDate = task.value?.dueDate || ''
  taskEditDialog.value = true
}

async function updateTask() {
  if (!task.value) return

  if (!canManageCurrentTask.value) {
    Notify.error(PERMISSION_MESSAGES.manageTask)
    return
  }

  if (!taskForm.title.trim()) {
    Notify.error('Le titre de la task est requis.')
    return
  }

  taskLoading.value = true
  try {
    await crmApi.patchTask(task.value.id, {
      title: taskForm.title.trim(),
      description: taskForm.description.trim() || undefined,
      priority: taskForm.priority,
      dueDate: taskForm.dueDate || undefined,
    })
    taskEditDialog.value = false
    Notify.success('Task mise à jour.')
    await loadData()
  } catch (error) {
    Notify.error(getErrorMessage(error, 'Erreur de mise à jour task.'))
  } finally {
    taskLoading.value = false
  }
}

async function deleteTask() {
  if (!task.value) return

  if (!canManageCurrentTask.value) {
    Notify.error(PERMISSION_MESSAGES.manageTask)
    return
  }

  taskLoading.value = true
  try {
    await crmApi.deleteTask(task.value.id)
    Notify.success('Task supprimée.')
    await navigateTo(projectLink.value)
  } catch (error) {
    Notify.error(getErrorMessage(error, 'Erreur de suppression task.'))
  } finally {
    taskLoading.value = false
  }
}

async function updateTaskStatus(action: 'start' | 'complete' | 'archive' | 'reopen') {
  if (!task.value) return

  if (!canChangeTaskStatus.value) {
    Notify.error(PERMISSION_MESSAGES.manageTask)
    return
  }

  taskLoading.value = true
  try {
    if (action === 'start') await crmApi.startTask(task.value.id)
    if (action === 'complete') await crmApi.completeTask(task.value.id)
    if (action === 'archive') await crmApi.archiveTask(task.value.id)
    if (action === 'reopen') await crmApi.reopenTask(task.value.id)
    Notify.success('Statut de la task mis à jour.')
    await loadData()
  } catch (error) {
    Notify.error(getErrorMessage(error, 'Erreur changement statut task.'))
  } finally {
    taskLoading.value = false
  }
}

onMounted(loadData)
watch(taskId, loadData)
</script>

<template>
  <v-container fluid>
    <div class="d-flex align-center justify-space-between mb-4 flex-wrap ga-2">
      <div>
        <h1 class="text-h5">CRM · Task {{ task?.title || '' }}</h1>
        <p class="text-body-2 text-medium-emphasis">ID: {{ taskId }}</p>
      </div>
      <div class="d-flex ga-2 flex-wrap justify-end">
        <v-btn variant="tonal" prepend-icon="mdi-arrow-left" :to="projectLink">
          Retour projet
        </v-btn>
        <v-btn
          variant="tonal"
          prepend-icon="mdi-view-kanban-outline"
          :to="projectKanbanLink"
        >
          Kanban projet
        </v-btn>
        <v-btn
          variant="tonal"
          prepend-icon="mdi-refresh"
          :loading="loading"
          @click="loadData"
        >
          Recharger
        </v-btn>
        <v-tooltip
          :text="canCreateRequest ? '' : PERMISSION_MESSAGES.createTaskRequest"
          location="top"
        >
          <template #activator="{ props }">
            <span v-bind="props">
              <v-btn
                color="primary"
                prepend-icon="mdi-plus"
                :disabled="!canCreateRequest"
                @click="createDialog = true"
              >
                Créer request
              </v-btn>
            </span>
          </template>
        </v-tooltip>
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
      <v-card-title>Informations task</v-card-title>
      <v-card-text>
        <v-skeleton-loader v-if="loading" type="article" />
        <template v-else>
          <div class="d-flex flex-column ga-2">
            <p class="mb-0"><strong>Title :</strong> {{ task?.title || 'N/A' }}</p>
            <p class="mb-0">
              <strong>Description :</strong>
              {{ task?.description || 'Aucune description.' }}
            </p>
            <p class="mb-0">
              <strong>Status :</strong>
              <TaskStatusChip
                v-if="task?.status"
                :status="toTaskChipStatus(task.status)"
              />
              <span v-else>N/A</span>
            </p>
            <p class="mb-0"><strong>Priority :</strong> {{ task?.priority || 'N/A' }}</p>
            <p class="mb-0"><strong>Due date :</strong> {{ task?.dueDate || '-' }}</p>
            <p class="mb-0"><strong>Project :</strong> {{ projectId || '-' }}</p>
          </div>

          <div class="d-flex ga-2 flex-wrap mt-4">
            <v-tooltip
              :text="canManageCurrentTask ? '' : PERMISSION_MESSAGES.manageTask"
              location="top"
            >
              <template #activator="{ props }">
                <span v-bind="props">
                  <v-btn
                    variant="tonal"
                    prepend-icon="mdi-pencil"
                    :disabled="!canManageCurrentTask"
                    @click="openTaskEditDialog"
                  >
                    Éditer
                  </v-btn>
                </span>
              </template>
            </v-tooltip>

            <v-tooltip
              :text="canManageCurrentTask ? '' : PERMISSION_MESSAGES.manageTask"
              location="top"
            >
              <template #activator="{ props }">
                <span v-bind="props">
                  <v-btn
                    variant="tonal"
                    color="error"
                    prepend-icon="mdi-delete"
                    :disabled="!canManageCurrentTask"
                    :loading="taskLoading"
                    @click="deleteTask"
                  >
                    Supprimer
                  </v-btn>
                </span>
              </template>
            </v-tooltip>

            <v-tooltip
              :text="canChangeTaskStatus ? '' : PERMISSION_MESSAGES.manageTask"
              location="top"
            >
              <template #activator="{ props }">
                <span v-bind="props">
                  <v-menu :disabled="!canChangeTaskStatus">
                    <template #activator="{ props: menuProps }">
                      <v-btn
                        variant="tonal"
                        prepend-icon="mdi-swap-horizontal"
                        v-bind="menuProps"
                        :disabled="!canChangeTaskStatus"
                      >
                        Changer statut
                      </v-btn>
                    </template>
                    <v-list density="compact">
                      <v-list-item title="Démarrer" @click="updateTaskStatus('start')" />
                      <v-list-item title="Terminer" @click="updateTaskStatus('complete')" />
                      <v-list-item title="Archiver" @click="updateTaskStatus('archive')" />
                      <v-list-item title="Rouvrir" @click="updateTaskStatus('reopen')" />
                    </v-list>
                  </v-menu>
                </span>
              </template>
            </v-tooltip>
          </div>
        </template>
      </v-card-text>
    </v-card>

    <v-card>
      <v-card-title>Requests liées</v-card-title>
      <v-table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Statut demandé</th>
            <th>Statut request</th>
            <th>Note</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="request in requests" :key="request.id">
            <td>{{ request.id }}</td>
            <td>{{ request.requestedStatus || '-' }}</td>
            <td>
              <TaskRequestStatusChip
                :status="toRequestChipStatus(request.status)"
              />
            </td>
            <td>{{ request.note || '-' }}</td>
            <td class="text-right">
              <v-tooltip
                :text="canEditRequest ? '' : PERMISSION_MESSAGES.updateTaskRequest"
                location="top"
              >
                <template #activator="{ props }">
                  <span v-bind="props">
                    <v-btn
                      size="small"
                      variant="text"
                      icon="mdi-pencil"
                      :disabled="!canEditRequest"
                      @click="openEditRequest(request)"
                    />
                  </span>
                </template>
              </v-tooltip>

              <v-tooltip
                :text="
                  canUpdateSingleRequestStatus(request)
                    ? ''
                    : PERMISSION_MESSAGES.updateTaskRequestStatus
                "
                location="top"
              >
                <template #activator="{ props }">
                  <span v-bind="props">
                    <v-menu :disabled="!canUpdateSingleRequestStatus(request)">
                      <template #activator="{ props: menuProps }">
                        <v-btn
                          size="small"
                          variant="text"
                          icon="mdi-swap-horizontal"
                          v-bind="menuProps"
                          :disabled="!canUpdateSingleRequestStatus(request)"
                        />
                      </template>
                      <v-list density="compact">
                        <v-list-item
                          v-for="status in requestStatuses"
                          :key="status"
                          :title="requestStatusLabels[status]"
                          @click="changeRequestStatus(request, status)"
                        />
                      </v-list>
                    </v-menu>
                  </span>
                </template>
              </v-tooltip>

              <v-tooltip
                :text="canDeleteRequest ? '' : PERMISSION_MESSAGES.updateTaskRequest"
                location="top"
              >
                <template #activator="{ props }">
                  <span v-bind="props">
                    <v-btn
                      size="small"
                      variant="text"
                      color="error"
                      icon="mdi-delete"
                      :disabled="!canDeleteRequest"
                      @click="removeRequest(request.id)"
                    />
                  </span>
                </template>
              </v-tooltip>
            </td>
          </tr>
          <tr v-if="!loading && !requests.length">
            <td colspan="5" class="text-center py-4">
              Aucune request liée à cette task.
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <v-dialog v-model="createDialog" max-width="520">
      <v-card>
        <v-card-title>Créer une request</v-card-title>
        <v-card-text>
          <v-form ref="createRequestFormRef">
            <v-select
              v-model="requestForm.requestedStatus"
              :items="requestedTaskStatuses"
              label="Statut demandé"
              :rules="requestRules.requestedStatus"
            />
            <v-textarea
              v-model="requestForm.note"
              label="Note"
              rows="3"
              counter="600"
              :rules="requestRules.note"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            :disabled="requestLoading"
            @click="createDialog = false"
          >
            Annuler
          </v-btn>
          <v-btn
            color="primary"
            :loading="requestLoading"
            :disabled="!canCreateRequest"
            @click="createRequest"
          >
            Créer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="editDialog" max-width="520">
      <v-card>
        <v-card-title>Éditer request</v-card-title>
        <v-card-text>
          <v-form ref="editRequestFormRef">
            <v-select
              v-model="requestForm.requestedStatus"
              :items="requestedTaskStatuses"
              label="Statut demandé"
              :rules="requestRules.requestedStatus"
            />
            <v-textarea
              v-model="requestForm.note"
              label="Note"
              rows="3"
              counter="600"
              :rules="requestRules.note"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            :disabled="requestLoading"
            @click="editDialog = false"
          >
            Annuler
          </v-btn>
          <v-btn
            color="primary"
            :loading="requestLoading"
            :disabled="!canEditRequest"
            @click="updateRequest"
          >
            Enregistrer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="taskEditDialog" max-width="560">
      <v-card>
        <v-card-title>Éditer task</v-card-title>
        <v-card-text>
          <v-text-field v-model="taskForm.title" label="Title" autofocus />
          <v-textarea v-model="taskForm.description" label="Description" rows="3" />
          <v-select
            v-model="taskForm.priority"
            :items="['low', 'medium', 'high', 'critical']"
            label="Priority"
          />
          <v-text-field v-model="taskForm.dueDate" label="Due date" type="date" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" :disabled="taskLoading" @click="taskEditDialog = false">
            Annuler
          </v-btn>
          <v-btn
            color="primary"
            :loading="taskLoading"
            :disabled="!canManageCurrentTask"
            @click="updateTask"
          >
            Enregistrer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
