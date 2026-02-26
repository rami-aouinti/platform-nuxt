<script setup lang="ts">
import { Notify } from '~/stores/notification'
import { useCrmApi } from '~/composables/api/useCrmApi'
import type {
  CrmTask,
  CrmTaskRequest,
  CrmTaskRequestStatus,
} from '~/composables/api/useCrmApi'

const crmApi = useCrmApi()
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
const changingRequestStatus = ref<string>('')
const selectedProjectId = ref<string>('')
const selectedTaskId = ref<string>('')
const projects = ref<{ id: string; name: string }[]>([])
const tasks = ref<CrmTask[]>([])
const taskRequests = ref<CrmTaskRequest[]>([])
const draggedRequestId = ref<string>('')

const requestColumns = [
  { key: 'pending', label: 'Pending', color: 'warning' },
  { key: 'approved', label: 'Approved', color: 'success' },
  { key: 'rejected', label: 'Rejected', color: 'error' },
  { key: 'cancelled', label: 'Cancelled', color: 'default' },
] as const

function normalizeItems<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[]
  if (
    value &&
    typeof value === 'object' &&
    'items' in value &&
    Array.isArray((value as { items?: unknown }).items)
  ) {
    return (value as { items: unknown[] }).items as T[]
  }
  if (
    value &&
    typeof value === 'object' &&
    'data' in value &&
    Array.isArray((value as { data?: unknown }).data)
  ) {
    return (value as { data: unknown[] }).data as T[]
  }
  return []
}

const selectedTask = computed(() =>
  tasks.value.find((task) => String(task.id) === selectedTaskId.value) || null,
)

const requestsByStatus = computed(() => {
  return requestColumns.reduce(
    (acc, column) => {
      acc[column.key] = taskRequests.value.filter(
        (request) => request.status === column.key,
      )
      return acc
    },
    {
      pending: [] as CrmTaskRequest[],
      approved: [] as CrmTaskRequest[],
      rejected: [] as CrmTaskRequest[],
      cancelled: [] as CrmTaskRequest[],
    },
  )
})

function getRequestTitle(request: CrmTaskRequest) {
  return request.note?.trim() || `Request ${request.id.slice(0, 8)}`
}

function requestCount(status: CrmTaskRequestStatus) {
  return requestsByStatus.value[status].length
}

async function loadProjectsAndTasks() {
  loading.value = true
  try {
    const projectsResult = await crmApi.listProjects()
    projects.value = normalizeItems<{ id: string; name: string }>(projectsResult)

    if (!selectedProjectId.value && projects.value.length) {
      selectedProjectId.value = String(projects.value[0].id)
    }

    if (!selectedProjectId.value) {
      tasks.value = []
      selectedTaskId.value = ''
      taskRequests.value = []
      return
    }

    const tasksResult = await crmApi.listProjectTasks(selectedProjectId.value)
    tasks.value = normalizeItems<CrmTask>(tasksResult)

    if (!tasks.value.some((task) => String(task.id) === selectedTaskId.value)) {
      selectedTaskId.value = tasks.value[0] ? String(tasks.value[0].id) : ''
    }

    await loadTaskRequests()
  } catch (error) {
    Notify.error(
      error instanceof Error ? error.message : 'Erreur chargement kanban CRM.',
    )
  } finally {
    loading.value = false
  }
}

async function loadTaskRequests() {
  if (!selectedTaskId.value) {
    taskRequests.value = []
    return
  }

  requestsLoading.value = true
  try {
    const requestsResult = await crmApi.listTaskTaskRequests(selectedTaskId.value)
    taskRequests.value = normalizeItems<CrmTaskRequest>(requestsResult)
  } catch (error) {
    Notify.error(
      error instanceof Error
        ? error.message
        : 'Erreur chargement task requests.',
    )
  } finally {
    requestsLoading.value = false
  }
}

function onRequestDragStart(requestId: string) {
  draggedRequestId.value = requestId
}

function onRequestDragEnd() {
  draggedRequestId.value = ''
}

async function updateRequestStatus(requestId: string, nextStatus: CrmTaskRequestStatus) {
  const request = taskRequests.value.find((item) => item.id === requestId)
  if (!request || request.status === nextStatus) return

  const previousStatus = request.status
  request.status = nextStatus
  changingRequestStatus.value = requestId

  try {
    if (nextStatus === 'approved') {
      await crmApi.approveTaskRequest(requestId)
    } else if (nextStatus === 'rejected') {
      await crmApi.rejectTaskRequest(requestId)
    } else if (nextStatus === 'cancelled') {
      await crmApi.cancelTaskRequest(requestId)
    } else {
      await crmApi.patchTaskRequest(requestId, { status: nextStatus })
    }

    Notify.success('Status de la request mis à jour.')
    await loadTaskRequests()
  } catch (error) {
    request.status = previousStatus
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

function onDropRequest(status: CrmTaskRequestStatus) {
  if (!draggedRequestId.value) return
  updateRequestStatus(draggedRequestId.value, status)
}

function statusChipColor(status: CrmTaskRequestStatus) {
  if (status === 'approved') return 'success'
  if (status === 'rejected') return 'error'
  if (status === 'cancelled') return 'default'
  return 'warning'
}

watch(selectedProjectId, async () => {
  if (!selectedProjectId.value) {
    tasks.value = []
    selectedTaskId.value = ''
    taskRequests.value = []
    return
  }

  loading.value = true
  try {
    const tasksResult = await crmApi.listProjectTasks(selectedProjectId.value)
    tasks.value = normalizeItems<CrmTask>(tasksResult)
    selectedTaskId.value = tasks.value[0] ? String(tasks.value[0].id) : ''
    await loadTaskRequests()
  } catch (error) {
    Notify.error(
      error instanceof Error ? error.message : 'Erreur chargement des tasks.',
    )
  } finally {
    loading.value = false
  }
})

watch(selectedTaskId, loadTaskRequests)

onMounted(() => {
  const queryProjectId = route.query.projectId
  if (typeof queryProjectId === 'string') {
    selectedProjectId.value = queryProjectId
  }
  loadProjectsAndTasks()
})
</script>

<template>
  <v-container fluid class="kanban-page">
    <div class="d-flex align-center justify-space-between mb-4 flex-wrap ga-2">
      <div>
        <h1 class="text-h5">CRM Kanban</h1>
        <p class="text-body-2 text-medium-emphasis mb-0">
          5 colonnes : 1 Tasks + 4 statuts de Task Requests
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
          @click="loadProjectsAndTasks"
          >Recharger</v-btn
        >
      </div>
    </div>

    <v-row class="mb-3">
      <v-col cols="12" md="6">
        <v-select
          v-model="selectedProjectId"
          :items="projects"
          item-title="name"
          item-value="id"
          label="Projet"
          clearable
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-select
          v-model="selectedTaskId"
          :items="tasks"
          item-title="title"
          item-value="id"
          label="Task active"
          clearable
          :disabled="!tasks.length"
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
            v-if="!tasks.length"
            type="info"
            variant="tonal"
            text="Aucune task pour ce projet."
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
                  <v-chip size="x-small" :color="statusChipColor(request.status)" variant="tonal">
                    {{ request.status }}
                  </v-chip>
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
      :text="`Task active: ${selectedTask.title}`"
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
