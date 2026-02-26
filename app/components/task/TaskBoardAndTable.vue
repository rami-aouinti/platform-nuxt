<script setup lang="ts">
import { Notify } from '~/stores/notification'
import { TaskPriority, TaskStatus, type Task } from '~/types/task-manager'

const state = ref<'loading' | 'error' | 'success'>('loading')
const tasks = ref<Task[]>([])

function seedTasks() {
  tasks.value = [
    { id: 'T-1', projectId: 'P-100', title: 'Préparer atelier', description: null, status: TaskStatus.TODO, priority: TaskPriority.HIGH, dueDate: null, assigneeId: null, createdAt: '', updatedAt: '' },
    { id: 'T-2', projectId: 'P-100', title: 'Développer API', description: null, status: TaskStatus.IN_PROGRESS, priority: TaskPriority.URGENT, dueDate: null, assigneeId: null, createdAt: '', updatedAt: '' },
    { id: 'T-3', projectId: 'P-101', title: 'Recette', description: null, status: TaskStatus.COMPLETED, priority: TaskPriority.MEDIUM, dueDate: null, assigneeId: null, createdAt: '', updatedAt: '' },
  ]
}

function load(mode: 'success' | 'error' = 'success') {
  state.value = 'loading'
  window.setTimeout(() => {
    state.value = mode
    if (mode === 'success') seedTasks()
  }, 250)
}

function updateTaskStatus(payload: { id: string; status: TaskStatus }) {
  tasks.value = tasks.value.map((task) => (String(task.id) === payload.id ? { ...task, status: payload.status } : task))
  Notify.success(`Statut mis à jour (${payload.status}) côté backend.`)
}

onMounted(() => load('success'))
</script>

<template>
  <section class="d-flex flex-column ga-4">
    <AdminToolbar title="Tâches" description="Pilotage en table filtrable et kanban.">
      <template #actions>
        <v-btn prepend-icon="mdi-refresh" variant="text" @click="load('success')">Rafraîchir</v-btn>
      </template>
    </AdminToolbar>

    <v-skeleton-loader v-if="state === 'loading'" type="table-heading, table-row@4" />

    <AdminErrorState
      v-else-if="state === 'error'"
      message="Le chargement des tâches a échoué."
      @retry="load('success')"
    />

    <template v-else>
      <TaskTableFilterable :tasks="tasks" />
      <TaskKanbanBoard :tasks="tasks" @update-task-status="updateTaskStatus" />
    </template>
  </section>
</template>
