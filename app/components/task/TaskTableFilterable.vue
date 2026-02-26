<script setup lang="ts">
import { TaskPriority, TaskStatus, type Task } from '~/types/task-manager'

const props = defineProps<{ tasks: Task[] }>()

const filters = reactive({
  projectId: 'all',
  priority: 'all',
  status: 'all',
})

const projectItems = computed(() => {
  const unique = [...new Set(props.tasks.map((task) => String(task.projectId)))]
  return [{ title: 'Tous les projets', value: 'all' }, ...unique.map((projectId) => ({ title: projectId, value: projectId }))]
})

const filteredTasks = computed(() => props.tasks.filter((task) => {
  const byProject = filters.projectId === 'all' || String(task.projectId) === filters.projectId
  const byPriority = filters.priority === 'all' || task.priority === filters.priority
  const byStatus = filters.status === 'all' || task.status === filters.status
  return byProject && byPriority && byStatus
}))
</script>

<template>
  <v-card>
    <v-card-text>
      <div class="d-flex flex-wrap ga-3 mb-4">
        <v-select v-model="filters.projectId" :items="projectItems" label="Projet" density="comfortable" variant="outlined" hide-details class="flex-1-1" />
        <v-select
          v-model="filters.priority"
          :items="[
            { title: 'Toutes les priorités', value: 'all' },
            { title: 'Basse', value: TaskPriority.LOW },
            { title: 'Moyenne', value: TaskPriority.MEDIUM },
            { title: 'Haute', value: TaskPriority.HIGH },
            { title: 'Urgente', value: TaskPriority.URGENT },
          ]"
          label="Priorité"
          density="comfortable"
          variant="outlined"
          hide-details
          class="flex-1-1"
        />
        <v-select
          v-model="filters.status"
          :items="[
            { title: 'Tous les statuts', value: 'all' },
            { title: 'À faire', value: TaskStatus.TODO },
            { title: 'En cours', value: TaskStatus.IN_PROGRESS },
            { title: 'Terminée', value: TaskStatus.COMPLETED },
            { title: 'Archivée', value: TaskStatus.ARCHIVED },
          ]"
          label="Statut"
          density="comfortable"
          variant="outlined"
          hide-details
          class="flex-1-1"
        />
      </div>

      <AdminEmptyState
        v-if="filteredTasks.length === 0"
        title="Aucune tâche"
        message="Aucune tâche ne correspond aux filtres sélectionnés."
      />

      <v-data-table
        v-else
        :headers="[
          { title: 'Titre', key: 'title' },
          { title: 'Projet', key: 'projectId' },
          { title: 'Priorité', key: 'priority' },
          { title: 'Statut', key: 'status' },
        ]"
        :items="filteredTasks"
        item-value="id"
      >
        <template #item.status="{ item }">
          <TaskStatusChip :status="item.status" />
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>
