<script setup lang="ts">
import { Notify } from '~/stores/notification'
import { useCrmApi } from '~/composables/api/useCrmApi'
import type {
  CrmTask,
  CrmTaskRequest,
  CrmTaskStatus,
} from '~/composables/api/useCrmApi'

type CrmTaskExtended = CrmTask & {
  permissions?: {
    canCreateRequest?: boolean
    canEditRequest?: boolean
    canDeleteRequest?: boolean
    canChangeRequestStatus?: boolean
  } | null
}

const route = useRoute()
const crmApi = useCrmApi()

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
const task = ref<CrmTaskExtended | null>(null)
const requests = ref<CrmTaskRequest[]>([])
const errorMessage = ref('')

const createDialog = ref(false)
const editDialog = ref(false)
const editedRequest = ref<CrmTaskRequest | null>(null)

const requestForm = reactive({
  requestedStatus: 'in_progress' as CrmTaskStatus,
  note: '',
})

const requestStatuses = [
  'pending',
  'approved',
  'rejected',
  'cancelled',
] as const

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

function resolveRequestTaskId(request: CrmTaskRequest): string {
  if (typeof request.task === 'string') return request.task
  if (request.task && typeof request.task === 'object')
    return String(request.task.id ?? '')
  return ''
}

const canCreateRequest = computed(
  () => task.value?.permissions?.canCreateRequest ?? true,
)
const canEditRequest = computed(
  () => task.value?.permissions?.canEditRequest ?? true,
)
const canDeleteRequest = computed(
  () => task.value?.permissions?.canDeleteRequest ?? true,
)
const canChangeRequestStatus = computed(
  () => task.value?.permissions?.canChangeRequestStatus ?? true,
)

async function loadData() {
  if (!taskId.value) return

  loading.value = true
  errorMessage.value = ''
  try {
    const [taskResult, requestsResult] = await Promise.all([
      crmApi.getTask(taskId.value),
      crmApi.listTaskRequests(),
    ])

    task.value = taskResult as CrmTaskExtended
    requests.value = normalizeItems<CrmTaskRequest>(requestsResult).filter(
      (entry) => resolveRequestTaskId(entry) === taskId.value,
    )
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
  requestLoading.value = true
  try {
    await crmApi.createTaskRequest({
      task: taskId.value,
      type: 'status_change',
      requestedStatus: requestForm.requestedStatus,
      note: requestForm.note.trim() || undefined,
    })
    createDialog.value = false
    requestForm.requestedStatus = 'in_progress'
    requestForm.note = ''
    Notify.success('Request créée.')
    await loadData()
  } catch (error) {
    Notify.error(getErrorMessage(error, 'Erreur de création de request.'))
  } finally {
    requestLoading.value = false
  }
}

function openEditRequest(request: CrmTaskRequest) {
  editedRequest.value = request
  requestForm.requestedStatus = request.requestedStatus ?? 'in_progress'
  requestForm.note = request.note ?? ''
  editDialog.value = true
}

async function updateRequest() {
  if (!editedRequest.value) return

  requestLoading.value = true
  try {
    await crmApi.patchTaskRequest(editedRequest.value.id, {
      requestedStatus: requestForm.requestedStatus,
      note: requestForm.note.trim() || undefined,
    })
    editDialog.value = false
    editedRequest.value = null
    requestForm.requestedStatus = 'in_progress'
    requestForm.note = ''
    Notify.success('Request mise à jour.')
    await loadData()
  } catch (error) {
    Notify.error(getErrorMessage(error, 'Erreur mise à jour request.'))
  } finally {
    requestLoading.value = false
  }
}

async function removeRequest(requestId: string) {
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
  requestId: string,
  status: (typeof requestStatuses)[number],
) {
  requestLoading.value = true
  try {
    if (status === 'approved') await crmApi.approveTaskRequest(requestId)
    if (status === 'rejected') await crmApi.rejectTaskRequest(requestId)
    if (status === 'cancelled') await crmApi.cancelTaskRequest(requestId)
    if (status === 'pending') {
      Notify.info(
        'Le statut pending est un état initial, aucun endpoint dédié.',
      )
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
      <div class="d-flex ga-2">
        <v-btn
          variant="tonal"
          prepend-icon="mdi-briefcase-outline"
          :to="
            task?.project && !Array.isArray(task.project)
              ? `/crm/projects/${task.project.id || ''}`
              : '/crm'
          "
        >
          Projet
        </v-btn>
        <v-btn
          variant="tonal"
          prepend-icon="mdi-refresh"
          :loading="loading"
          @click="loadData"
          >Recharger</v-btn
        >
        <v-btn
          v-if="canCreateRequest"
          color="primary"
          prepend-icon="mdi-plus"
          @click="createDialog = true"
          >Créer request</v-btn
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
      <v-card-title>Détails task</v-card-title>
      <v-card-text>
        <v-skeleton-loader v-if="loading" type="article" />
        <template v-else>
          <p class="mb-2">
            <strong>Titre :</strong> {{ task?.title || 'N/A' }}
          </p>
          <p class="mb-2">
            <strong>Statut :</strong> {{ task?.status || 'N/A' }}
          </p>
          <p class="mb-2">
            <strong>Priorité :</strong> {{ task?.priority || 'N/A' }}
          </p>
          <p class="mb-0">
            <strong>Description :</strong>
            {{ task?.description || 'Aucune description.' }}
          </p>
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
            <td>{{ request.status }}</td>
            <td>{{ request.note || '-' }}</td>
            <td class="text-right">
              <v-btn
                v-if="canEditRequest"
                size="small"
                variant="text"
                icon="mdi-pencil"
                @click="openEditRequest(request)"
              />
              <v-menu v-if="canChangeRequestStatus">
                <template #activator="{ props }">
                  <v-btn
                    size="small"
                    variant="text"
                    icon="mdi-swap-horizontal"
                    v-bind="props"
                  />
                </template>
                <v-list density="compact">
                  <v-list-item
                    v-for="status in requestStatuses"
                    :key="status"
                    :title="status"
                    @click="changeRequestStatus(request.id, status)"
                  />
                </v-list>
              </v-menu>
              <v-btn
                v-if="canDeleteRequest"
                size="small"
                variant="text"
                color="error"
                icon="mdi-delete"
                @click="removeRequest(request.id)"
              />
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
          <v-select
            v-model="requestForm.requestedStatus"
            :items="['todo', 'in_progress', 'done', 'archived']"
            label="Statut demandé"
          />
          <v-textarea v-model="requestForm.note" label="Note" rows="3" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            :disabled="requestLoading"
            @click="createDialog = false"
            >Annuler</v-btn
          >
          <v-btn
            color="primary"
            :loading="requestLoading"
            @click="createRequest"
            >Créer</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="editDialog" max-width="520">
      <v-card>
        <v-card-title>Éditer request</v-card-title>
        <v-card-text>
          <v-select
            v-model="requestForm.requestedStatus"
            :items="['todo', 'in_progress', 'done', 'archived']"
            label="Statut demandé"
          />
          <v-textarea v-model="requestForm.note" label="Note" rows="3" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            :disabled="requestLoading"
            @click="editDialog = false"
            >Annuler</v-btn
          >
          <v-btn
            color="primary"
            :loading="requestLoading"
            @click="updateRequest"
            >Enregistrer</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
