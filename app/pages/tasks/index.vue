<script setup lang="ts">
import { Notify } from '~/stores/notification'
import { HttpRequestError } from '../../../services/http/client'
import type { TaskItem } from '~/composables/api/useTasksApi'
import {useTasksApi} from "~/composables/api/useTasksApi"

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
  <TaskBoardAndTable />
</template>
