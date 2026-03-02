<script setup lang="ts">
import { Notify } from '~/stores/notification'
import { TaskRequestStatus, TaskRequestType, type TaskRequest } from '~/types/task-manager'

interface TaskRequestView extends TaskRequest {
  title: string
}

const state = ref<'loading' | 'error' | 'success'>('loading')
const myRequests = ref<TaskRequestView[]>([])
const reviewRequests = ref<TaskRequestView[]>([])
const dialogOpen = ref(false)
const confirmRef = useTemplateRef('confirmRef')

function seedRows() {
  myRequests.value = [
    { id: 'R-1', taskId: 'T-1', requesterId: 'me', reason: 'Besoin d\'accès', status: TaskRequestStatus.PENDING, type: TaskRequestType.ACCESS, comment: null, createdAt: '', updatedAt: '', title: 'Accès API' },
  ]
  reviewRequests.value = [
    { id: 'R-2', taskId: 'T-2', requesterId: 'u-22', reason: 'Bloqué', status: TaskRequestStatus.PENDING, type: TaskRequestType.EXTENSION, comment: null, createdAt: '', updatedAt: '', title: 'Extension délai' },
  ]
}

function load(mode: 'success' | 'error' = 'success') {
  state.value = 'loading'
  window.setTimeout(() => {
    state.value = mode
    if (mode === 'success') seedRows()
  }, 250)
}

function createRequest(payload: { taskId: string; reason: string; type: TaskRequestType }) {
  myRequests.value = [
    {
      id: `R-${Date.now()}`,
      taskId: payload.taskId,
      requesterId: 'me',
      reason: payload.reason,
      status: TaskRequestStatus.PENDING,
      type: payload.type,
      comment: null,
      createdAt: '',
      updatedAt: '',
      title: `Demande ${payload.type}`,
    },
    ...myRequests.value,
  ]
  Notify.success(String(useNuxtApp().$i18n.t('notifications.ui.requestCreatedBackend')))
}

async function runAction(row: TaskRequestView, action: 'approve' | 'reject' | 'cancel') {
  if (!confirmRef.value) {
    return
  }

  const confirmed = await confirmRef.value.open(`Confirmer l'action ${action} sur la demande ${row.id} ?`)
  if (!confirmed) {
    return
  }

  const nextStatus = {
    approve: TaskRequestStatus.APPROVED,
    reject: TaskRequestStatus.REJECTED,
    cancel: TaskRequestStatus.CANCELED,
  }[action]

  myRequests.value = myRequests.value.map((item) => (item.id === row.id ? { ...item, status: nextStatus } : item))
  reviewRequests.value = reviewRequests.value.map((item) => (item.id === row.id ? { ...item, status: nextStatus } : item))
  Notify.success(String(useNuxtApp().$i18n.t('notifications.ui.requestActionBackend', { action: action === 'approve' ? useNuxtApp().$i18n.t('notifications.ui.requestActionApproved') : action === 'reject' ? useNuxtApp().$i18n.t('notifications.ui.requestActionRejected') : useNuxtApp().$i18n.t('notifications.ui.requestActionCanceled') })))
}

onMounted(() => load('success'))
</script>

<template>
  <section class="d-flex flex-column ga-4">
    <AdminToolbar title="Demandes de tâches" description="Suivi des demandes à créer/valider.">
      <template #actions>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="dialogOpen = true">Nouvelle demande</v-btn>
      </template>
    </AdminToolbar>

    <v-skeleton-loader v-if="state === 'loading'" type="table-heading, table-row@4" />
    <AdminErrorState v-else-if="state === 'error'" message="Impossible de charger les demandes." @retry="load('success')" />

    <template v-else>
      <v-card>
        <v-card-title>Mes demandes</v-card-title>
        <v-card-text>
          <AdminEmptyState v-if="myRequests.length === 0" title="Aucune demande" message="Vous n'avez pas encore de demande." />
          <v-data-table
            v-else
            :items="myRequests"
            :headers="[
            { title: 'Demande', key: 'title' },
            { title: 'Statut', key: 'status' },
            { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
          ]"
            item-value="id"
          >
            <template #item.status="{ item }"><TaskRequestStatusChip :status="item.status" /></template>
            <template #item.actions="{ item }">
              <v-btn size="small" variant="text" color="warning" :disabled="item.status !== TaskRequestStatus.PENDING" @click="runAction(item, 'cancel')">Annuler</v-btn>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>

      <v-card>
        <v-card-title>À valider</v-card-title>
        <v-card-text>
          <AdminEmptyState v-if="reviewRequests.length === 0" title="Rien à valider" message="Aucune demande en attente de validation." />
          <v-data-table
            v-else
            :items="reviewRequests"
            :headers="[
            { title: 'Demande', key: 'title' },
            { title: 'Statut', key: 'status' },
            { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
          ]"
            item-value="id"
          >
            <template #item.status="{ item }"><TaskRequestStatusChip :status="item.status" /></template>
            <template #item.actions="{ item }">
              <div class="d-flex ga-1 justify-end">
                <v-btn size="small" variant="text" color="primary" :disabled="item.status !== TaskRequestStatus.PENDING" @click="runAction(item, 'approve')">Approuver</v-btn>
                <v-btn size="small" variant="text" color="error" :disabled="item.status !== TaskRequestStatus.PENDING" @click="runAction(item, 'reject')">Rejeter</v-btn>
              </div>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </template>

    <TaskRequestCreateDialog v-model="dialogOpen" @submit="createRequest" />
    <DialogConfirm ref="confirmRef" />
  </section>
</template>
