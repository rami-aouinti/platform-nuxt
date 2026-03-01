<script setup lang="ts">
import { Notify } from '~/stores/notification'
import { TaskStatus, type Task } from '~/types/task-manager'

const { t } = useI18n()
defineProps<{ tasks: Task[] }>()

const emit = defineEmits<{
  updateTaskStatus: [payload: { id: string; status: TaskStatus }]
}>()

const confirmRef = useTemplateRef('confirmRef')

type KanbanColumn = 'todo' | 'in_progress' | 'done' | 'archived'

const columns: { key: KanbanColumn; title: string }[] = [
  { key: 'todo', title: t('tasks.columns.todo') },
  { key: 'in_progress', title: t('tasks.columns.inProgress') },
  { key: 'done', title: t('tasks.columns.done') },
  { key: 'archived', title: t('tasks.columns.archived') },
]

function inColumn(task: Task, column: KanbanColumn) {
  if (column === 'done') return task.status === TaskStatus.COMPLETED
  return task.status === column
}

async function archiveTask(task: Task) {
  if (!confirmRef.value) {
    return
  }

  const confirmed = await confirmRef.value.open(t('tasks.confirmArchive', { title: task.title }))
  if (!confirmed) {
    return
  }

  emit('updateTaskStatus', { id: String(task.id), status: TaskStatus.ARCHIVED })
  Notify.success('Tâche archivée côté backend.')
}
</script>

<template>
  <div>
    <v-row>
      <v-col v-for="column in columns" :key="column.key" cols="12" md="3">
        <v-card class="h-100">
          <v-card-title>{{ column.title }}</v-card-title>
          <v-divider />
          <v-card-text class="d-flex flex-column ga-3">
            <v-card v-for="task in tasks.filter((item) => inColumn(item, column.key))" :key="task.id" variant="outlined">
              <v-card-text class="pb-2">
                <div class="text-subtitle-2 mb-2">{{ task.title }}</div>
                <TaskStatusChip :status="task.status" />
              </v-card-text>
              <v-card-actions>
                <v-btn size="x-small" variant="text" @click="emit('updateTaskStatus', { id: String(task.id), status: TaskStatus.IN_PROGRESS })">{{ t('tasks.actions.start') }}</v-btn>
                <v-btn size="x-small" variant="text" @click="emit('updateTaskStatus', { id: String(task.id), status: TaskStatus.COMPLETED })">{{ t('tasks.actions.complete') }}</v-btn>
                <v-btn size="x-small" variant="text" color="error" @click="archiveTask(task)">{{ t('tasks.actions.archive') }}</v-btn>
              </v-card-actions>
            </v-card>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <DialogConfirm ref="confirmRef" />
  </div>
</template>
