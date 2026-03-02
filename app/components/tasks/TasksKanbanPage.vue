<script setup lang="ts">
import { Notify } from '~/stores/notification'
import { canManageTask, type ProjectPermissionSubject, type TaskManagerUser } from '~/utils/permissions/task-manager'

type TasksState = 'loading' | 'empty' | 'error' | 'success'
type TaskWorkflowAction = 'start' | 'complete' | 'archive' | 'reopen'
type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'archived'

interface KanbanTask {
  id: string
  title: string
  status: TaskStatus
  assigneeId?: string | null
}

const { t } = useI18n()
const authStore = useAuthStore()
const state = ref<TasksState>('loading')
const tasks = ref<KanbanTask[]>([])

const project = ref<ProjectPermissionSubject>({ ownerId: '12', managerIds: ['34'] })
const actionDeniedMessage = 'Action interdite : permissions insuffisantes sur cette tâche.'

const currentUser = computed<TaskManagerUser>(() => ({
  id: authStore.profile?.id ?? '99',
  roles: authStore.roles,
}))

const columns = computed(() => [
  { title: t('tasks.columns.todo'), status: 'todo' as const },
  { title: t('tasks.columns.inProgress'), status: 'in_progress' as const },
  { title: t('tasks.columns.done'), status: 'completed' as const },
  { title: t('tasks.columns.archived'), status: 'archived' as const },
])

const actionsByStatus: Record<TaskStatus, TaskWorkflowAction[]> = {
  todo: ['start', 'archive'],
  in_progress: ['complete', 'archive'],
  completed: ['reopen', 'archive'],
  archived: ['reopen'],
}

function canRunTaskAction(task: KanbanTask) {
  return canManageTask(currentUser.value, task, project.value)
}

function actionLabel(action: TaskWorkflowAction) {
  return {
    start: t('tasks.actions.start'),
    complete: t('tasks.actions.complete'),
    archive: t('tasks.actions.archive'),
    reopen: t('tasks.actions.reopen'),
  }[action]
}

function nextStatus(action: TaskWorkflowAction): TaskStatus {
  return {
    start: 'in_progress',
    complete: 'completed',
    archive: 'archived',
    reopen: 'todo',
  }[action]
}

function isForbiddenError(errorValue: unknown) {
  return Boolean(errorValue && typeof errorValue === 'object' && 'status' in errorValue && errorValue.status === 403)
}

function fakeTaskApi(action: TaskWorkflowAction, task: KanbanTask) {
  return new Promise<void>((resolve, reject) => {
    window.setTimeout(() => {
      if (action === 'archive' && task.id === 'TASK-2') {
        reject({ status: 403, message: 'Forbidden' })
        return
      }
      resolve()
    }, 200)
  })
}

async function runTaskAction(task: KanbanTask, action: TaskWorkflowAction) {
  if (!canRunTaskAction(task)) {
    Notify.error(actionDeniedMessage)
    return
  }

  const previous = task.status
  task.status = nextStatus(action)

  try {
    await fakeTaskApi(action, task)
    Notify.success(String(useNuxtApp().$i18n.t('notifications.ui.actionApplied', { action: actionLabel(action) })))
  } catch (errorValue) {
    task.status = previous
    if (isForbiddenError(errorValue)) {
      Notify.error(String(useNuxtApp().$i18n.t('notifications.ui.taskActionForbidden403')))
      return
    }
    Notify.error(String(useNuxtApp().$i18n.t('notifications.ui.taskActionFailed')))
  }
}

function load(stateMode: TasksState = 'success') {
  state.value = 'loading'

  window.setTimeout(() => {
    state.value = stateMode
    tasks.value = stateMode === 'success'
      ? [
          { id: 'TASK-1', title: 'Rédiger specs', status: 'todo', assigneeId: '12' },
          { id: 'TASK-2', title: 'Développer API projet', status: 'in_progress', assigneeId: '77' },
          { id: 'TASK-3', title: 'Valider maquettes', status: 'completed', assigneeId: '99' },
        ]
      : []
  }, 500)
}

onMounted(() => load('success'))
</script>

<template>
  <v-container class="py-6">
    <div class="d-flex align-center justify-space-between mb-4 ga-2 flex-wrap">
      <h1 class="text-h5">{{ t('tasks.title') }}</h1>
      <div class="d-flex ga-2 flex-wrap">
        <v-btn variant="text" prepend-icon="mdi-sync" @click="load('success')">{{ t('common.reload') }}</v-btn>
        <v-btn variant="text" @click="load('empty')">{{ t('common.simulateEmpty') }}</v-btn>
        <v-btn variant="text" color="error" @click="load('error')">{{ t('common.simulateError') }}</v-btn>
      </div>
    </div>

    <div v-if="state === 'loading'" class="d-flex flex-column ga-3">
      <v-skeleton-loader type="list-item-three-line, list-item-three-line, list-item-three-line" />
      <v-progress-circular indeterminate color="primary" size="24" class="mx-auto" />
    </div>

    <v-alert v-else-if="state === 'empty'" type="info" variant="tonal" border="start">
      Aucune tâche planifiée.
    </v-alert>

    <v-alert v-else-if="state === 'error'" type="error" variant="tonal" border="start">
      Impossible de récupérer les tâches.
      <template #append>
        <v-btn size="small" color="error" variant="outlined" @click="load('success')">Réessayer</v-btn>
      </template>
    </v-alert>

    <v-row v-else>
      <v-col v-for="column in columns" :key="column.title" cols="12" md="3">
        <v-card class="h-100">
          <v-card-title>{{ column.title }}</v-card-title>
          <v-divider />
          <v-list>
            <v-list-item
              v-for="task in tasks.filter((entry) => entry.status === column.status)"
              :key="task.id"
              :title="task.title"
              prepend-icon="mdi-checkbox-marked-circle-outline"
            >
              <template #append>
                <div class="d-flex ga-2 align-center flex-wrap justify-end">
                  <template v-for="action in actionsByStatus[task.status]" :key="`${task.id}-${action}`">
                    <v-tooltip :text="canRunTaskAction(task) ? '' : actionDeniedMessage" location="top">
                      <template #activator="{ props: tooltipProps }">
                        <span v-bind="tooltipProps">
                          <v-btn size="x-small" variant="outlined" :disabled="!canRunTaskAction(task)" @click="runTaskAction(task, action)">
                            {{ actionLabel(action) }}
                          </v-btn>
                        </span>
                      </template>
                    </v-tooltip>
                  </template>
                </div>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
