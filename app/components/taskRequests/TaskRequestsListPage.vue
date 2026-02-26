<script setup lang="ts">
import { Notify } from '~/stores/notification'
import {
  canCancelTaskRequest,
  canReviewTaskRequest,
  type ProjectPermissionSubject,
  type TaskManagerUser,
  type TaskPermissionSubject,
  type TaskRequestContext,
} from '~/utils/permissions/task-manager'

type TaskRequestsState = 'loading' | 'empty' | 'error' | 'success'
type TaskRequestAction = 'approve' | 'reject' | 'cancel'

interface TaskRequestRow {
  id: string
  title: string
  requester: string
  requesterId: string
  priority: 'Low' | 'Medium' | 'High'
  status: 'pending' | 'approved' | 'rejected' | 'canceled'
  task: TaskPermissionSubject
  project: ProjectPermissionSubject
}

const authStore = useAuthStore()
const state = ref<TaskRequestsState>('loading')
const rows = ref<TaskRequestRow[]>([])

const actionDeniedMessage = 'Action interdite sur cette demande.'

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

function load(stateMode: TaskRequestsState = 'success') {
  state.value = 'loading'

  window.setTimeout(() => {
    state.value = stateMode
    rows.value = stateMode === 'success'
      ? [
          {
            id: 'REQ-1',
            title: 'Créer dashboard projet',
            requester: 'Sarah K.',
            requesterId: '88',
            priority: 'High',
            status: 'pending',
            task: { assigneeId: '12' },
            project: { ownerId: '12', managerIds: ['34'] },
          },
          {
            id: 'REQ-2',
            title: 'Ajouter exports CSV',
            requester: 'Marc R.',
            requesterId: '99',
            priority: 'Medium',
            status: 'pending',
            task: { assigneeId: '77' },
            project: { ownerId: '12', managerIds: ['34'] },
          },
        ]
      : []
  }, 500)
}

function isForbiddenError(errorValue: unknown) {
  return Boolean(errorValue && typeof errorValue === 'object' && 'status' in errorValue && errorValue.status === 403)
}

function canAction(row: TaskRequestRow, action: TaskRequestAction) {
  const context: TaskRequestContext = { task: row.task, project: row.project }

  if (action === 'cancel') {
    return canCancelTaskRequest(currentUser.value, row)
  }

  return canReviewTaskRequest(currentUser.value, row, context)
}

function nextStatus(action: TaskRequestAction): TaskRequestRow['status'] {
  return {
    approve: 'approved',
    reject: 'rejected',
    cancel: 'canceled',
  }[action]
}

function actionLabel(action: TaskRequestAction) {
  return {
    approve: 'Approve',
    reject: 'Reject',
    cancel: 'Cancel',
  }[action]
}

function fakeRequestsApi(action: TaskRequestAction, row: TaskRequestRow) {
  return new Promise<void>((resolve, reject) => {
    window.setTimeout(() => {
      if (action === 'reject' && row.id === 'REQ-2') {
        reject({ status: 403, message: 'Forbidden' })
        return
      }
      resolve()
    }, 200)
  })
}

async function runAction(row: TaskRequestRow, action: TaskRequestAction) {
  if (!canAction(row, action)) {
    Notify.error(actionDeniedMessage)
    return
  }

  const previous = row.status
  row.status = nextStatus(action)

  try {
    await fakeRequestsApi(action, row)
    Notify.success(`Demande ${actionLabel(action)}.`)
  } catch (errorValue) {
    row.status = previous
    if (isForbiddenError(errorValue)) {
      Notify.error('Action refusée (403). Le statut de la demande est inchangé.')
      return
    }
    Notify.error('Le traitement de la demande a échoué.')
  }
}

onMounted(() => load('success'))
</script>

<template>
  <v-container class="py-6">
    <div class="d-flex align-center justify-space-between mb-4 ga-2 flex-wrap">
      <h1 class="text-h5">Task requests</h1>
      <div class="d-flex ga-2 flex-wrap">
        <v-btn variant="text" prepend-icon="mdi-sync" @click="load('success')">Reload</v-btn>
        <v-btn variant="text" @click="load('empty')">Simuler empty</v-btn>
        <v-btn variant="text" color="error" @click="load('error')">Simuler error</v-btn>
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
        <v-btn size="small" color="error" variant="outlined" @click="load('success')">Réessayer</v-btn>
      </template>
    </v-alert>

    <v-data-table v-else :headers="headers" :items="rows" item-value="id" class="elevation-1">
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
