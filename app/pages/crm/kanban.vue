<script setup lang="ts">
import { Notify } from '~/stores/notification'
import { useCrmApi } from '~/composables/api/useCrmApi'
import { useUsersStore } from '~/stores/users'
import type {
  CrmTaskRequest,
  CrmTaskStatus,
  CrmSprintTaskRequestsGroup,
  CrmUser,
} from '~/composables/api/useCrmApi'

const crmApi = useCrmApi()
const usersStore = useUsersStore()
const route = useRoute()

definePageMeta({
  icon: 'mdi-view-kanban-outline',
  title: 'CRM Kanban',
  drawerIndex: 8,
  requiresAuth: true,
  middleware: ['auth'],
})

const loading = ref(false)
const requestsLoading = ref(false)
const usersLoading = ref(false)
const changingRequestStatus = ref<string>('')
const assigningRequester = ref<string>('')
const assigningReviewer = ref<string>('')
const selectedSprintId = ref<string>('')
const selectedTaskId = ref<string>('')
const selectedUserId = ref<string>('')
const groupedByTask = ref<CrmSprintTaskRequestsGroup[]>([])
const users = ref<CrmUser[]>([])
const draggedRequestId = ref<string>('')

const requestColumns = [
  { key: 'todo', label: 'Todo', color: 'info' },
  { key: 'in_progress', label: 'In Progress', color: 'warning' },
  { key: 'done', label: 'Done', color: 'success' },
  { key: 'archived', label: 'Archived', color: 'default' },
] as const

const tasks = computed(() => groupedByTask.value.map((group) => group.task))

const selectedTask = computed(() =>
  tasks.value.find((task) => String(task.id) === selectedTaskId.value) || null,
)

const taskRequests = computed<CrmTaskRequest[]>(() => {
  const group = groupedByTask.value.find(
    (item) => String(item.task.id) === selectedTaskId.value,
  )
  return group?.taskRequests ?? []
})

const userOptions = computed(() => {
  return users.value.map((user) => ({
    id: String(user.id),
    label: getUserLabel(user),
  }))
})

const requestsByStatus = computed(() => {
  return requestColumns.reduce(
    (acc, column) => {
      acc[column.key] = taskRequests.value.filter(
        (request) => (request.requestedStatus ?? 'todo') === column.key,
      )
      return acc
    },
    {
      todo: [] as CrmTaskRequest[],
      in_progress: [] as CrmTaskRequest[],
      done: [] as CrmTaskRequest[],
      archived: [] as CrmTaskRequest[],
    },
  )
})

function getUserLabel(user: CrmUser) {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
  if (fullName) return `${fullName} (${user.username ?? user.email ?? user.id})`
  return user.username ?? user.email ?? String(user.id)
}


function userIdFromRef(value: CrmTaskRequest['requester'] | CrmTaskRequest['reviewer'], fallback?: string | null) {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && value.id) return String(value.id)
  return fallback ?? ''
}

function getRequestTitle(request: CrmTaskRequest) {
  return request.note?.trim() || `Request ${request.id.slice(0, 8)}`
}

function requestCount(status: CrmTaskStatus) {
  return requestsByStatus.value[status].length
}

async function loadUsers() {
  usersLoading.value = true
  try {
    await usersStore.fetchRows({ silent: true })
    users.value = [...usersStore.rows]
  } catch (error) {
    Notify.error(error instanceof Error ? error.message : 'Erreur chargement des utilisateurs.')
  } finally {
    usersLoading.value = false
  }
}

async function loadSprintTaskRequests() {
  if (!selectedSprintId.value) {
    groupedByTask.value = []
    selectedTaskId.value = ''
    return
  }

  requestsLoading.value = true
  try {
    const response = await crmApi.listTaskRequestsBySprintGroupedByTask(
      selectedSprintId.value,
      selectedUserId.value || undefined,
    )

    groupedByTask.value = response.groupedByTask ?? []

    if (!tasks.value.some((task) => String(task.id) === selectedTaskId.value)) {
      selectedTaskId.value = tasks.value[0] ? String(tasks.value[0].id) : ''
    }
  } catch (error) {
    Notify.error(
      error instanceof Error
        ? error.message
        : 'Erreur chargement task requests du sprint.',
    )
  } finally {
    requestsLoading.value = false
  }
}

async function reloadKanban() {
  loading.value = true
  try {
    await loadSprintTaskRequests()
  } finally {
    loading.value = false
  }
}

function onRequestDragStart(requestId: string) {
  draggedRequestId.value = requestId
}

function onRequestDragEnd() {
  draggedRequestId.value = ''
}

async function updateRequestStatus(requestId: string, nextStatus: CrmTaskStatus) {
  const request = taskRequests.value.find((item) => item.id === requestId)
  if (!request || request.requestedStatus === nextStatus) return

  const previousStatus = request.requestedStatus
  request.requestedStatus = nextStatus
  changingRequestStatus.value = requestId

  try {
    await crmApi.patchTaskRequestRequestedStatus(requestId, nextStatus)

    Notify.success(String(useNuxtApp().$i18n.t('notifications.ui.requestStatusUpdated')))
    await loadSprintTaskRequests()
  } catch (error) {
    request.requestedStatus = previousStatus
    Notify.error(
      error instanceof Error
        ? error.message
        : 'Impossible de changer le status de la request.',
    )
  } finally {
    changingRequestStatus.value = ''
    draggedRequestId.value = ''
  }
}

async function assignRequester(requestId: string, requesterId: string) {
  if (!requesterId) return
  assigningRequester.value = requestId
  try {
    await crmApi.assignTaskRequestRequester(requestId, requesterId)
    Notify.success(String(useNuxtApp().$i18n.t('notifications.ui.requesterAssigned')))
    await loadSprintTaskRequests()
  } catch (error) {
    Notify.error(error instanceof Error ? error.message : 'Impossible d’assigner le requester.')
  } finally {
    assigningRequester.value = ''
  }
}

async function assignReviewer(requestId: string, reviewerId: string) {
  if (!reviewerId) return
  assigningReviewer.value = requestId
  try {
    await crmApi.assignTaskRequestReviewer(requestId, reviewerId)
    Notify.success(String(useNuxtApp().$i18n.t('notifications.ui.reviewerAssigned')))
    await loadSprintTaskRequests()
  } catch (error) {
    Notify.error(error instanceof Error ? error.message : 'Impossible d’assigner le reviewer.')
  } finally {
    assigningReviewer.value = ''
  }
}

function onDropRequest(status: CrmTaskStatus) {
  if (!draggedRequestId.value) return
  updateRequestStatus(draggedRequestId.value, status)
}

function statusChipColor(status?: CrmTaskStatus | null) {
  if (status === 'done') return 'success'
  if (status === 'archived') return 'default'
  if (status === 'in_progress') return 'warning'
  return 'info'
}

function requestStatusChipColor(status: CrmTaskRequest['status']) {
  if (status === 'approved') return 'success'
  if (status === 'rejected') return 'error'
  if (status === 'cancelled') return 'default'
  return 'warning'
}

watch(selectedSprintId, reloadKanban)
watch(selectedUserId, reloadKanban)

onMounted(async () => {
  const querySprintId = route.query.sprintId
  if (typeof querySprintId === 'string') {
    selectedSprintId.value = querySprintId
  }

  const queryUserId = route.query.userId
  if (typeof queryUserId === 'string') {
    selectedUserId.value = queryUserId
  }

  await Promise.all([loadUsers(), reloadKanban()])
})
</script>

<template>
  <v-container fluid class="kanban-page">
    <div class="d-flex align-center justify-space-between mb-4 flex-wrap ga-2">
      <div>
        <h1 class="text-h5">CRM Kanban</h1>
        <p class="text-body-2 text-medium-emphasis mb-0">
          Task requests d'un sprint groupées par task
        </p>
      </div>
      <div class="d-flex ga-2">
        <v-btn variant="tonal" to="/crm" prepend-icon="mdi-arrow-left"
          >Retour CRM</v-btn
        >
        <v-btn
          variant="tonal"
          prepend-icon="mdi-refresh"
          :loading="loading || requestsLoading"
          @click="reloadKanban"
          >Recharger</v-btn
        >
      </div>
    </div>

    <v-row class="mb-3">
      <v-col cols="12" md="4">
        <v-text-field
          v-model="selectedSprintId"
          label="Sprint ID"
          clearable
          placeholder="73000000-0000-1000-8000-000000000001"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field
          v-model="selectedUserId"
          label="Filtre User ID (optionnel)"
          clearable
          placeholder="550e8400-e29b-11d4-a716-446655440000"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-autocomplete
          :items="userOptions"
          item-title="label"
          item-value="id"
          label="Users assignables"
          chips
          variant="outlined"
          :loading="usersLoading"
          readonly
          hint="Source utilisée pour assigner requester/reviewer"
          persistent-hint
        />
      </v-col>
    </v-row>

    <div class="kanban-grid">
      <v-card class="kanban-column">
        <v-card-title class="d-flex align-center justify-space-between">
          <span>Tasks</span>
          <v-chip size="small" variant="tonal">{{ tasks.length }}</v-chip>
        </v-card-title>
        <v-divider />
        <v-card-text class="kanban-scroll">
          <v-alert
            v-if="!selectedSprintId"
            type="info"
            variant="tonal"
            text="Saisissez un sprint ID pour charger les tasks."
          />
          <v-alert
            v-else-if="!tasks.length"
            type="info"
            variant="tonal"
            text="Aucune task pour ce sprint."
          />

          <v-card
            v-for="task in tasks"
            :key="task.id"
            variant="outlined"
            class="mb-3 task-card"
            :class="{ 'task-card--active': String(task.id) === selectedTaskId }"
            @click="selectedTaskId = String(task.id)"
          >
            <v-card-item>
              <v-card-title class="text-subtitle-2">{{ task.title }}</v-card-title>
              <v-card-subtitle>
                <v-chip size="x-small" variant="tonal" class="mr-1">{{ task.priority }}</v-chip>
                <v-chip size="x-small" variant="outlined">{{ task.status }}</v-chip>
              </v-card-subtitle>
            </v-card-item>
          </v-card>
        </v-card-text>
      </v-card>

      <v-card
        v-for="column in requestColumns"
        :key="column.key"
        class="kanban-column"
        @dragover.prevent
        @drop.prevent="onDropRequest(column.key)"
      >
        <v-card-title class="d-flex align-center justify-space-between">
          <span>{{ column.label }}</span>
          <v-chip size="small" :color="column.color" variant="tonal">
            {{ requestCount(column.key) }}
          </v-chip>
        </v-card-title>
        <v-divider />
        <v-card-text class="kanban-scroll">
          <v-alert
            v-if="!selectedTaskId"
            type="info"
            variant="tonal"
            text="Sélectionnez une task pour voir ses requests."
          />

          <v-alert
            v-else-if="requestsLoading"
            type="info"
            variant="tonal"
            text="Chargement des requests..."
          />

          <template v-else>
            <v-card
              v-for="request in requestsByStatus[column.key]"
              :key="request.id"
              class="mb-3 request-card"
              variant="outlined"
              draggable="true"
              @dragstart="onRequestDragStart(request.id)"
              @dragend="onRequestDragEnd"
            >
              <v-card-item>
                <v-card-title class="text-subtitle-2">{{ getRequestTitle(request) }}</v-card-title>
                <v-card-subtitle class="d-flex align-center justify-space-between ga-2">
                  <span class="text-caption">{{ request.type }}</span>
                  <v-progress-circular
                    v-if="changingRequestStatus === request.id"
                    indeterminate
                    size="14"
                    width="2"
                  />
                </v-card-subtitle>
              </v-card-item>
              <v-card-text class="pt-0">
                <div class="d-flex align-center justify-space-between">
                  <span class="text-caption text-medium-emphasis">{{ request.id.slice(0, 8) }}</span>
                  <div class="d-flex ga-1">
                    <v-chip size="x-small" :color="statusChipColor(request.requestedStatus)" variant="tonal">
                      {{ request.requestedStatus || 'todo' }}
                    </v-chip>
                    <v-chip size="x-small" :color="requestStatusChipColor(request.status)" variant="outlined">
                      {{ request.status }}
                    </v-chip>
                  </div>
                </div>

                <div class="mt-3">
                  <v-select
                    :items="userOptions"
                    item-title="label"
                    item-value="id"
                    :model-value="userIdFromRef(request.requester, request.requesterId)"
                    label="Requester"
                    density="compact"
                    variant="outlined"
                    hide-details
                    :loading="assigningRequester === request.id"
                    @update:model-value="(value) => assignRequester(request.id, String(value || ''))"
                  />
                </div>

                <div class="mt-2">
                  <v-select
                    :items="userOptions"
                    item-title="label"
                    item-value="id"
                    :model-value="userIdFromRef(request.reviewer, request.reviewerId)"
                    label="Reviewer"
                    density="compact"
                    variant="outlined"
                    hide-details
                    :loading="assigningReviewer === request.id"
                    @update:model-value="(value) => assignReviewer(request.id, String(value || ''))"
                  />
                </div>
              </v-card-text>
            </v-card>

            <v-alert
              v-if="!requestsByStatus[column.key].length"
              type="info"
              variant="tonal"
              text="Aucune request"
            />
          </template>
        </v-card-text>
      </v-card>
    </div>

    <v-alert
      v-if="selectedTask"
      class="mt-4"
      type="success"
      variant="tonal"
      :text="`Task active: ${selectedTask.title} (${selectedTask.status})`"
    />
  </v-container>
</template>

<style scoped>
.kanban-page {
  background: linear-gradient(180deg, rgb(var(--v-theme-surface)) 0%, rgb(var(--v-theme-background)) 100%);
}

.kanban-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(260px, 1fr));
  gap: 16px;
  align-items: start;
}

.kanban-column {
  min-height: 62vh;
  border-radius: 14px;
}

.kanban-scroll {
  max-height: 62vh;
  overflow-y: auto;
}

.task-card,
.request-card {
  border-radius: 12px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.task-card:hover,
.request-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.request-card {
  cursor: grab;
}

.task-card--active {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 1px rgba(var(--v-theme-primary), 0.25);
}

@media (max-width: 1900px) {
  .kanban-grid {
    grid-template-columns: repeat(2, minmax(260px, 1fr));
  }
}

@media (max-width: 900px) {
  .kanban-grid {
    grid-template-columns: 1fr;
  }

  .kanban-column,
  .kanban-scroll {
    min-height: auto;
    max-height: none;
  }
}
</style>
