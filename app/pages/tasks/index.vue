<script setup lang="ts">
import { Notify } from '~/stores/notification'
import { HttpRequestError } from '../../../services/http/client'
import type { TaskItem } from '~/composables/api/useTasksApi'

definePageMeta({
  icon: 'mdi-format-list-checks',
  title: 'Tasks',
  drawerIndex: 6,
  requiresAuth: true,
})

const tasksApi = useTasksApi()

const loading = ref(false)
const error = ref<string | null>(null)
const tasks = ref<TaskItem[]>([])

function toErrorMessage(errorValue: unknown) {
  if (errorValue instanceof HttpRequestError) return errorValue.message
  if (errorValue instanceof Error) return errorValue.message
  return 'Impossible de charger les tasks.'
}

function statusColor(status: TaskItem['status']) {
  if (status === 'done') return 'success'
  if (status === 'in_progress') return 'warning'
  if (status === 'archived') return 'default'
  return 'info'
}

function priorityColor(priority: TaskItem['priority']) {
  if (priority === 'critical') return 'error'
  if (priority === 'high') return 'warning'
  if (priority === 'medium') return 'info'
  return 'default'
}

async function loadTasks() {
  loading.value = true
  error.value = null

  try {
    tasks.value = await tasksApi.list()
  } catch (errorValue) {
    error.value = toErrorMessage(errorValue)
    Notify.error(error.value)
  } finally {
    loading.value = false
  }
}

onMounted(loadTasks)
</script>

<template>
  <v-container fluid>
    <v-row class="mb-2" align="center" justify="space-between">
      <v-col cols="12" md="8">
        <h1 class="text-h5 font-weight-bold">Tasks</h1>
      </v-col>
      <v-col cols="12" md="4" class="d-flex justify-md-end">
        <v-btn variant="tonal" prepend-icon="mdi-refresh" :loading="loading" @click="loadTasks">
          Recharger
        </v-btn>
      </v-col>
    </v-row>

    <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
      {{ error }}
    </v-alert>

    <v-card>
      <v-data-table
        :items="tasks"
        :loading="loading"
        item-value="id"
        :headers="[
          { title: 'Titre', key: 'title' },
          { title: 'Priorité', key: 'priority' },
          { title: 'Statut', key: 'status' },
          { title: 'Échéance', key: 'dueDate' },
        ]"
      >
        <template #item.priority="{ item }">
          <v-chip size="small" :color="priorityColor(item.priority)">
            {{ item.priority }}
          </v-chip>
        </template>

        <template #item.status="{ item }">
          <v-chip size="small" :color="statusColor(item.status)">
            {{ item.status }}
          </v-chip>
        </template>

        <template #item.dueDate="{ item }">
          {{ item.dueDate ? new Date(item.dueDate).toLocaleDateString() : '-' }}
        </template>

        <template #no-data>
          <div class="py-6 text-medium-emphasis text-center">Aucune task trouvée.</div>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>
